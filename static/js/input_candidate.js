$('#candidateSentence').on('input', (e) => {
    const inputValue = e.target.value;
    $('#addCandidateSentence').prop('disabled', !inputContainsAlphanumericValues(inputValue));
});

$('#addCandidateSentence').click((e) => {
    const candidateSentence = $('#candidateSentence').val();
    if ($('#candidateSentenceList li').length > 0) {
        createWarningModalMessage({
            'title': 'Error: Too many candidates',
            'body': 'You can specify a maximum of one candidate for the calculation.<br>Do you want to replace the current candidate with the new one?',
            'show_replace_button': true
        });
        showWarningModal();
        $('#replace_button').click(() => {
            $('#candidateSentenceList').empty();
            $('#replace_button').off();
            addCandidateToList(candidateSentence);
            $('#warning_modal').modal('hide');
        });
        return;
    }
    addCandidateToList(candidateSentence);
});

function addCandidateToList(candidateSentence) {
    $('#candidateSentenceList').append(
        $('<li>').append(
            $('<i>').attr('class', 'bi bi-x list-remove-element me-1')
        ).append(
            $('<span>').append(candidateSentence)
    ));
    toggleCalculationButton();
    toggleRemoveParamButton()
}