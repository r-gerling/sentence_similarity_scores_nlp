import json
import math
import pandas as pd

def get_pcp_information(precisions, bp, number_of_weights):
    with open('static/json/permutations.json', 'r') as f:
        permutations = json.load(f)
        permutation_weights = permutations[str(number_of_weights)]
        score_perm_weights = appendScore(permutation_weights, precisions, bp)
        pcp_inf = doScoreBinning(score_perm_weights)
        return pcp_inf

def appendScore(weights: list[list], precisions: list, bp: float):
    for element in weights:
        sum = 0
        for index, value in enumerate(element):
            sum = sum + value * math.log(precisions[index + 1]['numerator'] / precisions[index + 1]['denominator'])
        sum = bp * math.exp(sum)
        element.append(sum)
    return weights

def doScoreBinning(listlist: list[list]):
    score_element_index = len(listlist[0]) - 1
    df = pd.DataFrame(listlist)
    min = df[score_element_index].min()
    max = df[score_element_index].max()

    range_dict = {}
    for i in range(0, 9):
        range_dict[i] = (round(min + i * (max - min) / 8, 2), round(min + (i + 1) * (max - min) / 8, 2))
    
    for element in listlist:
        if min == max:
            normalized_int = 0
        else:
            normalized = (element[score_element_index] - min) / (max - min)
            normalized_int = int(normalized * 8)
        element.append(normalized_int)

    new_list = []
    for row in listlist:
        ele_append = {}
        for col_idx, col in enumerate(row):
            if col_idx < len(row) - 2:
                ele_append['{0}gram'.format(col_idx + 1)] = col
            elif col_idx == len(row) - 2:
                ele_append['score'] = col
            elif col_idx == len(row) - 1:
                ele_append['class'] = col
        new_list.append(ele_append)
    return {
        'data': new_list,
        'colorRange': range_dict
    }
