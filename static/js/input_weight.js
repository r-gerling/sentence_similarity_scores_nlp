let weightCounter = parseInt($('#n_gram_count').text());

function weightCounterIsMinimal() {
    return weightCounter === 1;
}

$('#n_gram_weight_counter_remove')
.mouseenter(function() {
    if (!weightCounterIsMinimal()) {
        $(this).removeClass('bi-dash-circle bi-dash-circle-fill').addClass('bi-dash-circle-dotted');
    } else {
        $(this).css('cursor', 'default');
    }
})
.mouseleave(function() {
    $(this).removeClass('bi-dash-circle-dotted bi-dash-circle-fill').addClass('bi-dash-circle');
})
.mousedown(function() {
    if (!weightCounterIsMinimal()) {
        $(this).removeClass('bi-dash-circle bi-dash-circle-dotted').addClass('bi-dash-circle-fill');
        $(`#n${weightCounter}_gram_col`).remove();
        weightCounter--;
        $('#n_gram_count').text(weightCounter);
        const uniformWeight = 1 / weightCounter;
        $('.n-gram-wrapper input').each((_idx, inputElement) => $(inputElement).val(uniformWeight));
    }
})
.mouseup(function() {
    if (!weightCounterIsMinimal()) {
        $(this).removeClass('bi-dash-circle bi-dash-circle-fill').addClass('bi-dash-circle-dotted');
    } else {
        $(this).css('cursor', 'default');
        $(this).removeClass('bi-dash-circle-fill bi-das-circle-dotted').addClass('bi-dash-circle');
    }
});

$('#n_gram_weight_counter_add')
.mouseenter(function() {
    $(this).removeClass('bi-plus-circle bi-plus-circle-fill').addClass('bi-plus-circle-dotted');
})
.mouseleave(function() {
    $(this).removeClass('bi-plus-circle-dotted bi-plus-circle-fill').addClass('bi-plus-circle');
})
.mousedown(function() {
    $(this).removeClass('bi-plus-circle bi-plus-circle-dotted').addClass('bi-plus-circle-fill');
    weightCounter++;
    $('#n_gram_count').text(weightCounter);
    $('#n_gram_weight_counter_remove').css('cursor', 'pointer');
    const ngram = `n${weightCounter}_gram`
    const uniformWeight = 1 / weightCounter;
    $('.n-gram-wrapper input').each((_idx, inputElement) => $(inputElement).val(uniformWeight));
    $('.n-gram-wrapper').append(
        $('<div>').attr('id', `${ngram}_col`).append(
            $('<label>').attr('for', ngram).text(`${weightCounter}-gram`)
        ).append(
            $('<input>').attr('id', ngram).attr('name', ngram).attr('type', 'number').attr('min', 0).attr('max', 1).attr('step', 0.05).attr('value', uniformWeight).addClass('form-control form-control-sm').attr('placeholder', '')
        ));
})
.mouseup(function() {
    $(this).removeClass('bi-plus-circle bi-plus-circle-fill').addClass('bi-plus-circle-dotted');
});


$('#addNGramWeights').click((e) => {
    let n_gram_weights = [];
    $(`.n-gram-wrapper`).children().each((_idx, element) => {
        n_gram_weights.push(parseFloat($(element).children('input').val()));
    });
    const sum = n_gram_weights.reduce((partialSum, element) => partialSum + element, 0);
    if (sum !== 1) {
        createWarningModalMessage({
            'title': 'Error: Sum of Weights',
            'body': `The sum of all weights has to equal 1.<br>You're sum equals ${sum}`,
            'show_replace_button': false
        });
        showWarningModal();
        return;
    }
    if ($('#weightsList li').length > 0) {
        createWarningModalMessage({
            'title': 'Error: Too many weights',
            'body': 'You can specify a maximum of one weight list for the calculation.<br>Do you want to replace the current weight list with the new weights?',
            'show_replace_button': true
        });
        showWarningModal();
        $('#replace_button').click(() => {
            $('#weightsList').empty();
            $('#replace_button').off();
            addWeightsToList(n_gram_weights);
            $('#warning_modal').modal('hide');
        });
        return;
    }
    addWeightsToList(n_gram_weights);
});

function addWeightsToList(weights) {
    $('#weightsList').append(
        $('<li>').append(
            $('<i>').attr('class', 'bi bi-x list-remove-element me-1')
        ).append(
            $('<span>').text(JSON.stringify(weights).replaceAll(',', ', '))
    ));
    toggleCalculationButton();
    toggleRemoveParamButton()
}