const exampleSentences = {
    'refLangInd': 'Der schnelle braune Fuchs springt über den faulen Hund.',
    'refMuGrTr1': 'On the roof of the neighbours house, the playful white cat plays with the clumsy gray cat.',
    'refMuGrTr2': 'The white cat and the gray cat play on the neighbours roof.',
    'refSyn': 'The quick brown fox jumps over the lazy dog.',
    'refAbb': 'Example metrics to evaluate machine translations are the WER and the BLEU metric.',
    'refStopCont': 'The white cat plays with the gray cat on the roof.',
    'refPos': 'The white cat plays with the gray mouse on the roof.',
    'candLangInd': 'Der flotte braune Fuchs hüpft über den faulen Hund.',
    'candMuGrTr': 'The playful white cat and the clumsy gray cat play on the roof of the neighbours house.',
    'candSyn': 'The fast brown fox hops over the lazy dog.',
    'candAbb': 'Example metrics to evaluate machine translations are the Word Error Rate and the Bilingual Evaluation Understudy metric.',
    'candStopCont1': 'The white cat fights with the gray cat on the roof.',
    'candStopCont2': 'The white cat plays with a gray cat on the roof.',
    'candPos1': 'A white cat plays with the gray mouse on the roof.',
    'candPos2': 'The white cat plays with a gray mouse on the roof.'
};

const keyToName = {
    'refLangInd_candLangInd': 'Language Independent',
    'refMuGrTr1_candMuGrTr': 'Multiple Ground Truths Single 1',
    'refMuGrTr2_candMuGrTr': 'Multiple Ground Truths Single 2',
    'refMuGrTr1_refMuGrTr2_candMuGrTr': 'Multiple Ground Truths Combined',
    'refSyn_candSyn': 'Synonyms',
    'refAbb_candAbb': 'Abbreviations',
    'refStopCont_candStopCont1': 'Changed Verb',
    'refStopCont_candStopCont2': 'Changed Article',
    'refPos_candPos1': 'Position: Start',
    'refPos_candPos2': 'Position: Center'
}

const referenceExamplePositiveKeys = ['refLangInd', 'refMuGrTr1', 'refMuGrTr2'];
const referenceExampleNegativeKeys = ['refSyn', 'refAbb', 'refStopCont', 'refPos'];


const candidateExamplePositiveKeys = ['candLangInd', 'candMuGrTr'];
const candidateExampleNegativeKeys = ['candSyn', 'candAbb', 'candStopCont1', 'candStopCont2', 'candPos1', 'candPos2'];

$(document).on('click', '.example-sentences' , function() {
    const exampleKey = $(this).find('span').attr('value');
    const listID = $(this).parent('ul').attr('id');
    if(listID.includes('reference')) {
        $('#referenceSentence').val(exampleSentences[exampleKey])
        $('#addReferenceSentence').attr('disabled', false)
    } else {
        $('#candidateSentence').val(exampleSentences[exampleKey])
        $('#addCandidateSentence').attr('disabled', false)
    }
});

function addDropdownDivider(elementID) {
    $(`#${elementID}`).append($('<li>').append($('<hr>').addClass('dropdown-divider')));
}

function addExampleKeysToDropdown(exampleKeyList, elementID) {
    exampleKeyList.forEach(key => $(`#${elementID}`).append(
        $('<li>').addClass('example-sentences').append(
            $('<span>').addClass('dropdown-item').text(key.replace('cand', '').replace('ref', '')).attr('value', key))));
}

function getDescription(references, candidate) {
    const refKeys = [];
    references.forEach(ref => refKeys.push(Object.keys(exampleSentences).find(key => exampleSentences[key] === ref)));
    const candKey = Object.keys(exampleSentences).find(key => exampleSentences[key] === candidate);
    let newKey = `${refKeys.join('_')}_${candKey}`;
    return newKey in keyToName ? keyToName[newKey] : '';
}
