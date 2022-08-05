$('#referenceSentence').on('input', (e) => {
    const inputValue = e.target.value;
    $('#addReferenceSentence').prop('disabled', !inputContainsAlphanumericValues(inputValue));
});

$('#addReferenceSentence').click((e) => {
    const referenceSentence = $('#referenceSentence').val();
    $('#referenceSentenceList').append(
        $('<li>').append(
            $('<i>').attr('class', 'bi bi-x list-remove-element me-1')
        ).append(
            $('<span>').text(referenceSentence)
    ));
    toggleCalculationButton();
    toggleRemoveParamButton()
});
