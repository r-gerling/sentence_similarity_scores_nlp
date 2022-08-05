const margin = { top: 30, right: 20, bottom: 30, left: 50 };
const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

let resultsAdded = 0;

$('#calculateBleuScore').click(async () => {
    toggleLoadingOverlay(true);
    let references = [];
    let candidate = '';
    let weights = JSON.parse($('#weightsList li').first().text());
    $('#referenceSentenceList li').each((_idx, element) => {
        references.push($(element).text());
    });
    $('#candidateSentenceList li').each((_idx, element) => {
        candidate = $(element).text();
    });
    const bleuResult = await fetchBleuScore(references, candidate, weights);
    const meteorResult = await fetchMeteorScore(references, candidate);
    const werResult = await fetchWerScore(references, candidate);
    const bertResult = $('#calculateBert').is(':checked') ? await fetchBertSimilarity(references, candidate) : [];
    const description = getDescription(references, candidate);
    appendBleuScoreToResultList(bleuResult, meteorResult, werResult, bertResult, description);
    toggleLoadingOverlay(false);
});

function appendBleuScoreToResultList(bleuResult, meteorResult, werResult, bertResult, description) {
    if (!$('#keep_history').is(':checked')) {
        $('#bleu_score_result').empty();
        resultsAdded = 0;
    }

    if (bleuResult?.warning === 'P0') {
        bleuResult.score = 0;
    }

    const createExpand = $('<div>').addClass('collapse mx-3 pb-2').attr('id', `result_${resultsAdded}_expand`)
        .append(bleuResult?.warning === 'P0' ? createAlert(bleuResult.warning, bleuResult.positionP0) : '')
        .append(createSentenceDiv(bleuResult))
        .append(bleuResult.hasOwnProperty('uniqueCandidateNGrams') && bleuResult.score !== 0 ? createNGramTables(bleuResult) : '')
        .append(bleuResult.hasOwnProperty('pcpInformation') && bleuResult.score !== 0 ? createPCP(bleuResult.pcpInformation) : '')
        .append(createComparisonDiv(bleuResult, meteorResult, werResult, bertResult));
    $('#bleu_score_result').append(
        $('<li>').append(
            $('<div>').addClass('result-header')
                .append(
                    $('<i>').attr('class', 'bi bi-x list-remove-element mx-1')
                ).append(
                    $('<div>').css('display', 'inline-block').css('width', '50%').append(
                        $('<span>').append($('<strong>')).text(bleuResult.score)
                    ).append(
                        $('<span>').css('float', 'right').css('font-size', '8px').text(description)
                    )
                ).append(
                    $('<a>').addClass('list-expand-element').attr('data-bs-toggle', 'collapse').attr('href', `#result_${resultsAdded}_expand`)
                        .attr('aria-expanded', false)
                        .html($('<i>').addClass('bi bi-chevron-down expand-caret mx-1'))
                )
        ).append(createExpand)
    );
    $(`#result_${resultsAdded}_expand_params`).collapse('show');
    $(`#result_${resultsAdded}_expand`).collapse('show');
    
    if (bleuResult.hasOwnProperty('pcpInformation')) {
        const pcp = new ParallelCoordinatePlot(margin, width, height, resultsAdded);
        pcp.create_parallel_coordinate_plot(bleuResult.pcpInformation.data, 0.5, 0.5);
    }
    resultsAdded++;
}

function createSentenceDiv(bleuResult) {
    const referenceList = $('<ul>').addClass('reference-list-result');
    bleuResult.referenceNGrams.forEach((tokenized_reference_ngram, ref_index) => {
        let refListElement = $('<li>');
        tokenized_reference_ngram[0].forEach((token, token_idx) => {
            refListElement.append($('<span>').attr('data-ref-index', ref_index)
                .attr('data-token-index', token_idx)
                .attr('data-result-index', resultsAdded)
                .addClass('result-param-ngram-hover').text(token));
        });
        referenceList.append(refListElement);
    });

    let candListElement = $('<li>');
    bleuResult.candidateNGrams[0].forEach((token, tokenIdx) => {
        candListElement.append($('<span>').attr('data-cand-index', 0)
                .attr('data-token-index', tokenIdx)
                .attr('data-result-index', resultsAdded)
                .addClass('result-param-ngram-hover').text(token));
    });
    const sentenceDiv = $('<div>').addClass('row')
        .append($('<div>').addClass('col-6')
            .append($('<span>').text('References'))
            .append(referenceList))
        .append($('<div>').addClass('col-4')
            .append($('<span>').text('Candidate'))
            .append($('<ul>').addClass('no-list-decoration candidate-list-result').append(candListElement)))
        .append($('<div>').addClass('col-2')
            .append($('<span>').text('Weights'))
            .append($('<ul>').addClass('no-list-decoration').append($('<li>').text(bleuResult.weights))));
    return createFoldableCard(sentenceDiv, 'Show calculation parameters?', `result_${resultsAdded}_expand_params`);
}

function createNGramTables(bleuResult) {
    const { referenceNGrams, candidateNGrams, uniqueCandidateNGrams, nGramOverlaps, brevityPenalty } = bleuResult;
    let topLevelDiv = $('<div>')
    topLevelDiv.append($('<div>').addClass('row').append($('<span>').css('font-size', '0.8em').text(`Brevity penalty: ${brevityPenalty}`)));
    let nGramTableRow = $('<div>').addClass('scrolling-wrapper-flexbox');
    candidateNGrams.forEach((candidate, idx) => {
        const candidateOccurrences = countOccurrences(candidate);
        const candidateIndices = calculateIndices(candidate);
        const referencesOccurrences = referenceNGrams.map(element => countOccurrences(element[idx]));
        const referencesIndices = referenceNGrams.map(element => calculateIndices(element[idx]));

        const header = $('<tr>')
            .append($('<td>').text(`c${idx + 1}g`))
            .append($('<td>').text(`#`))
        referencesOccurrences.forEach((_element, refIdx) => header.append($('<td>').text(`r${refIdx}`)));
        header.append($('<td>').text('min(cand, max(ri))'));

        let table = $('<table>').append(header)
        uniqueCandidateNGrams[idx].forEach(n_gram => {
            const bodyRow = $('<tr>').attr('data-cand-index', candidateIndices[n_gram]?.length > 0 ? `[${candidateIndices[n_gram].join()}]` : '[]')
                .attr('data-ref-index', `[${referencesIndices.map(reference => reference[n_gram]?.length > 0 ? `[${reference[n_gram].join()}]` : '[]')}]`)
                .attr('data-n-gram', idx + 1)
                .attr('data-result-index', resultsAdded)
                .addClass('hoverable-n-gram')
                    .append($('<td>').css('white-space', 'nowrap').text(n_gram))
                    .append($('<td>').text(candidateOccurrences[n_gram]))
            let maxCount = 0;
            referencesOccurrences.forEach(reference => {
                bodyRow.append($('<td>').text(reference[n_gram] || 0))
                maxCount = reference[n_gram] > maxCount ? reference[n_gram] : maxCount;
            });
            const value = Math.min(maxCount, candidateOccurrences[n_gram]);
            bodyRow.append($('<td>').text(value));
            table.append(bodyRow);
        });
        const sumMax = $('<tr>')
            .append($('<td>').attr('colspan', referencesOccurrences.length + 2).css('text-align', 'right').text('sum(max):'))
            .append($('<td>').text(nGramOverlaps[idx + 1].numerator));
        table.append(sumMax)
        const sumCand = $('<tr>')
            .append($('<td>').attr('colspan', referencesOccurrences.length + 2).css('text-align', 'right').text(`sum(c${idx + 1}g):`))
            .append($('<td>').text(nGramOverlaps[idx + 1].denominator));
        table.append(sumCand)
        const precisionRow = $('<tr>')
            .append($('<td>').attr('colspan', referencesOccurrences.length + 2).css('text-align', 'right').text('precision:'))
            .append($('<td>').text(`${nGramOverlaps[idx + 1].numerator}/${nGramOverlaps[idx + 1].denominator}`));
        table.append(precisionRow)
        let tableDiv = $('<div>').addClass('swf-card').append(table);
        nGramTableRow.append(tableDiv);
    });
    topLevelDiv.append($('<div>').addClass('row').append(nGramTableRow));
    return createFoldableCard(topLevelDiv, 'How is the score calculated?', `result_${resultsAdded}_expand_ngram_table`);
}

function createPCP(pcpInformation) {
    const { data, colorRange } = pcpInformation;
    const containsMultipleClasses = data[0][4] === data[data.length - 1][4];
    const pcp_div = $('<div>').append(containsMultipleClasses ? createColorList(colorRange) : '')
        .append($('<div>').attr('id', `vis_pcp${resultsAdded}`).addClass('svg-container'))
        .append($('<div>').attr('id', `pcp${resultsAdded}`));
    return createFoldableCard(pcp_div, 'BLEU-Score with different weights?', `result_${resultsAdded}_expand_pcp`);
}

function createColorList(colorRange) {
    let table = $('<table>').append($('<tr>'));
    cluster_color_array.forEach((color, index) => {
        let range_text = `<span>${colorRange[index][0]} &#8804; sc < ${colorRange[index][1]}</span>`;
        if (index === cluster_color_array.length - 1) {
            range_text = `<span>sc > ${colorRange[index][0]}</span>`;
        }
        table.append($('<td>').css('background-color', color).html(range_text).addClass(`${resultsAdded}-${index}-cluster`))
    });
    return $('<div>').addClass('color-scale-table col').append(table);
}

function createComparisonDiv(bleuResult, meteorResult, werResult, bertResult) {
    let bertTable = $('<span>').text('-');
    if (bertResult?.scores?.length > 0) {
        bertTable = $('<table>').css('border', 'none').append($('<tr>')
            .append($('<td>').text('Reference'))
            .append($('<td>').text('Precision'))
            .append($('<td>').text('Recall'))
            .append($('<td>').text('F1-score')))
        bertResult.scores.forEach((score, index) => {
            bertTable.append($('<tr>')
                .append($('<td>').text(index))
                .append($('<td>').text(score.precision))
                .append($('<td>').text(score.recall))
                .append($('<td>').text(score.f1score)));
        });
    }
    const comparisonDiv = $('<div>').addClass('col').append(
        $('<table>')
            .append($('<tr>')
                .append($('<td>').text('BLEU-score:'))
                .append($('<td>').text(bleuResult.score)))
            .append($('<tr>')
                    .append($('<td>').text('WER-score:'))
                    .append($('<td>').text(werResult.score)))
            .append($('<tr>')
                .append($('<td>').text('METEOR-score:'))
                .append($('<td>').text(meteorResult.score)))
            .append($('<tr>')
                .append($('<td>').text('BERT-score:'))
                .append($('<td>').html(bertTable))));
    return createFoldableCard(comparisonDiv, 'Further score to evaluate machine translations?', `result_${resultsAdded}_expand_comparison`);
}

function createFoldableCard(cardContent, cardTitle, collapsibleId) {
    return $('<div>').addClass('card row mb-1').css('background-color', 'inherit')
    .append($('<div>').addClass('card-body p-2')
        .append(
            $('<div>').addClass('card-title mb-0').append(
                $('<span>').text(cardTitle)
            ).append($('<a>').addClass('card-expand-element').attr('data-bs-toggle', 'collapse')
                .attr('href', `#${collapsibleId}`).attr('aria-expanded', false).attr('aria-controls', collapsibleId)
                .append($('<i>').addClass('bi expand-caret bi-chevron-down')))
        ).append($('<div>').attr('id', collapsibleId).addClass('collapse mt-2')
            .append($('<div>').addClass('card-text row mx-2')
                .append(cardContent))));
}

function countOccurrences(array) {
    return array.reduce((acc, curr) => {
        return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
    }, {});
}

function calculateIndices(array) {
    return array.reduce((acc, curr, idx) => {
        return acc[curr] ? acc[curr].push(idx) : acc[curr] = [idx], acc
    }, {});
}
