function inputContainsAlphanumericValues(value) {
    return value.length > 0 && (/[a-zA-Z]/.test(value) || /[0-9]/.test(value));
}

function toggleCalculationButton() {
    const calculationParametersGiven = $('#referenceSentenceList li').length > 0 
        && $('#candidateSentenceList li').length > 0
        && $('#weightsList li').length > 0;
    $('#calculateBleuScore').prop('disabled', !calculationParametersGiven);
}

function toggleRemoveParamButton() {
    const noParamsGiven = $('#referenceSentenceList li').length === 0 
        && $('#candidateSentenceList li').length === 0
        && $('#weightsList li').length === 0;
    $('#removeCalcParams').prop('disabled', noParamsGiven);
}

$('body').on('mouseenter', '.expand-caret', function() {
    $(this).removeClass('bi-chevron-down bi-caret-down-fill').addClass('bi-caret-down');
}).on('mouseleave', '.expand-caret', function() {
    $(this).removeClass('bi-caret-down bi-caret-down-fill').addClass('bi-chevron-down');
}).on('mousedown', '.expand-caret', function() {
    $(this).removeClass('bi-chevron-down bi-caret-down').addClass('bi-caret-down-fill');
}).on('mouseup', '.expand-caret', function() {
    $(this).removeClass('bi-chevron-down bi-caret-down-fill').addClass('bi-caret-down');
});


$('body').on('mouseenter', '.list-remove-element', function() {
    $(this).removeClass('bi-x bi-x-square-fill').addClass('bi-x-square');
}).on('mouseleave', '.list-remove-element', function() {
    $(this).removeClass('bi-x-square bi-x-square-fill').addClass('bi-x');
}).on('mousedown', '.list-remove-element', function() {
    $(this).closest('li').remove();
    $(this).removeClass('bi-x bi-x-square').addClass('bi-x-square-fill');
    toggleCalculationButton();
    toggleRemoveParamButton();
}).on('mouseup', '.list-remove-element', function() {
    $(this).removeClass('bi-x bi-x-square-fill').addClass('bi-x-square');
});

$('#removeCalcParams').click(() => {
    $('#referenceSentenceList').empty();
    $('#candidateSentenceList').empty();
    toggleCalculationButton();
    toggleRemoveParamButton();
});

function createWarningModalMessage(messageContent) {
    const { title, body, show_replace_button } = messageContent;
    $('#warning_modal .modal-title').text(title);
    $('#warning_modal .modal-body').html(body);
    $('#warning_modal #replace_button')[show_replace_button ? 'show' : 'hide']();
};

function showWarningModal() {
    $('#warning_modal').modal('show');
    $('body').addClass('no-padding');
}

function toggleLoadingOverlay(addOverlay) {
    $('button').prop('disabled', addOverlay ? true : false);
    $('body')[addOverlay ? 'addClass' : 'removeClass']('no-scroll');
    $('#overlay').css('display', addOverlay ? 'block' : 'none');
}

function createAlert(warningID, positionP0) {
    let warningMessage = '';
    switch (warningID) {
        case 'P0':
            warningMessage = `The result equals 0 since there are no equal n_grams of size >= ${positionP0} in the candidate.`
            break;
        default:
            warningMessage = 'All fine!'
        }
    return $('<div>').addClass('alert alert-warning').attr('role', 'alert').text(warningMessage);
}
