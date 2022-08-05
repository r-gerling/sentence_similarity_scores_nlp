$( document ).ready(() => {
    addExampleKeysToDropdown(referenceExampleNegativeKeys, 'reference_example_list');
    addDropdownDivider('reference_example_list');
    addExampleKeysToDropdown(referenceExamplePositiveKeys, 'reference_example_list');

    addExampleKeysToDropdown(candidateExampleNegativeKeys, 'candidate_example_list');
    addDropdownDivider('candidate_example_list');
    addExampleKeysToDropdown(candidateExamplePositiveKeys, 'candidate_example_list');
});


$('body').on('mouseenter', '.hoverable-n-gram', function() {
    const candTokenIndices = $(this).data('cand-index');
    const references = $(this).data('ref-index');
    const nGram = $(this).data('n-gram');
    const resultIndex = $(this).data('result-index');

    candTokenIndices.forEach(tokenIndex => {
        for (let i = 0; i < nGram; i++) {
            $('.candidate-list-result')
                .find(`[data-cand-index='0'][data-token-index='${tokenIndex + i}'][data-result-index='${resultIndex}']`)
                .addClass('ngram-result-table-hover');
        }
    });
    
    references.forEach((reference, referenceIdx) => {
        reference.forEach(tokenIndex => {
            for (let i = 0; i < nGram; i++) {
                $('.reference-list-result')
                    .find(`[data-ref-index='${referenceIdx}'][data-token-index='${tokenIndex + i}'][data-result-index='${resultIndex}']`)
                    .addClass('ngram-result-table-hover');
            }
        });
    });
}).on('mouseleave', '.hoverable-n-gram', function() {
    $('.ngram-result-table-hover').removeClass('ngram-result-table-hover');
});
