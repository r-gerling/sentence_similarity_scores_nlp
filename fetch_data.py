from flask import jsonify, request
from nltk.translate.bleu_score import sentence_bleu, modified_precision, brevity_penalty
from nltk.translate.meteor_score import meteor_score
from nltk.tokenize import word_tokenize
from nltk import ngrams
import nltk
from pcp_calculations import get_pcp_information
from jiwer import wer

nltk.download('wordnet')
nltk.download('omw-1.4')

import bert_score
def calculate_bert_similarity():
    request_params = request.json
    references = request_params['references']
    candidate = request_params['candidate']

    candidates = [ candidate  for _ in references ]

    scores = bert_score.score(candidates, references, 'microsoft/deberta-xlarge-mnli')

    precisions = scores[0].tolist()
    recalls = scores[1].tolist()
    f1s = scores[2].tolist()
    
    result_scores = []
    for index in range(0, len(precisions)):
        result_scores.append({
            'precision': round(precisions[index], 4),
            'recall': round(recalls[index], 4),
            'f1score': round(f1s[index], 4)
        })

    response = jsonify({
        'scores': result_scores
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


def calculateWerScore():
    request_params = request.json
    references = request_params['references']
    candidate = request_params['candidate']

    candidates = [candidate for _ in references]

    score = wer(references, candidates)
    response = jsonify({
        'score': round(score, 4)
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


def calculateMeteorScore():
    request_params = request.json
    references = request_params['references']
    candidate = request_params['candidate']

    tokenized_references = [word_tokenize(sentence) for sentence in references]
    tokenized_candidate = word_tokenize(candidate)

    score = meteor_score(tokenized_references, tokenized_candidate)

    response = jsonify({
        'score': round(score, 4)
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


def calculateBleuScore():
    request_params = request.json

    references = request_params['references']
    candidate = request_params['candidate']
    weights = request_params['weights']

    tokenized_references = [word_tokenize(sentence) for sentence in references]
    tokenized_candidate = word_tokenize(candidate)

    ref_cand_diffs = [len(tok_ref) - len(tokenized_candidate) for tok_ref in tokenized_references]
    ref_cand_diffs_abs = [abs(len(tok_ref) - len(tokenized_candidate)) for tok_ref in tokenized_references]
    min_ref_len = min(ref_cand_diffs_abs)

    closest_reference_length = min_ref_len
    if min_ref_len * -1 in ref_cand_diffs:
        closest_reference_length = min_ref_len * -1

    bp = brevity_penalty(closest_reference_length, len(tokenized_candidate))
    score = sentence_bleu(tokenized_references, tokenized_candidate, weights)

    response_object = {
        'score': score,
        'weights': weights,
        'references': references,
        'candidate': candidate,
        'brevityPenalty': bp
    }

    n_gram_overlaps = {}
    all_reference_n_grams = []
    all_unique_candidate_n_grams = []
    all_candidate_n_grams = []
    pcp_information = []

    has_0_precision = False
    position_P0 = 0

    for idx in range(0, len(weights)):
        overlap = modified_precision(tokenized_references, tokenized_candidate, idx + 1)
        if overlap.numerator == 0:
            has_0_precision = True
            position_P0 = idx + 1
            break
        n_gram_overlaps[idx + 1] = {
            'numerator': overlap.numerator,
            'denominator': overlap.denominator
        }

        candidate_n_grams = ngrams(tokenized_candidate, idx + 1)
        candidate_n_gram = []
        for n_gram in candidate_n_grams:
            candidate_n_gram.append(' '.join(list(n_gram)))
        all_candidate_n_grams.append(candidate_n_gram)

        unique_candidate_n_grams = []
        [unique_candidate_n_grams.append(x) for x in candidate_n_gram if x not in unique_candidate_n_grams]
        all_unique_candidate_n_grams.append(unique_candidate_n_grams)

    
    for tok_reference in tokenized_references:
        sent_n_grams = []
        for idx in range(0, len(weights)):
            reference_n_grams = ngrams(tok_reference, idx + 1)
            reference_n_gram = []
            for n_gram in reference_n_grams:
                reference_n_gram.append(' '.join(list(n_gram)))
            sent_n_grams.append(reference_n_gram)
        all_reference_n_grams.append(sent_n_grams)

    response_object['uniqueCandidateNGrams'] = all_unique_candidate_n_grams
    response_object['referenceNGrams'] = all_reference_n_grams
    response_object['candidateNGrams'] = all_candidate_n_grams
    response_object['nGramOverlaps'] = n_gram_overlaps

    if has_0_precision:
        response_object['warning'] = 'P0'
        response_object['positionP0'] = position_P0
    else:
        if len(weights) > 1:
            pcp_information = get_pcp_information(n_gram_overlaps, bp, len(weights))
            response_object['pcpInformation'] = pcp_information


    response = jsonify(
        response_object
    )
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
