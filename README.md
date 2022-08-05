# Sentence Similarities

This repository contains a little webapp to assess different similarity scores for the evaluation of machine translations and the calculation of sentence similarity. The primary goal was to evaluate a score called Bilingual Evaluation Understudy (BLEU)[[1]](#1), which is why the tool contains further informations about how the score is calculated. The other scores are shown without any further information, but they give a good indication how well BLEU performs. The following four scores are contained in the tool:

| Name of the Score | Abbreviation | Reference | Used Library |
|:---|:---|:---:|---:|
| Bilingual Evaluation Understudy | BLEU | [[1]](#1) | [NLTK: BLEU](https://www.nltk.org/_modules/nltk/translate/bleu_score.html) |
| Word Error Rate | WER | | [JIWER](https://pypi.org/project/jiwer/) |
| Metric for Evaluation of Translation with Explicit ORdering | METEOR | [[2]](#2) | [NLTK: METEOR](https://www.nltk.org/_modules/nltk/translate/meteor_score.html) |
| BERTscore | | [[3]](#3) | [bert-score](https://pypi.org/project/bert-score/) |

Used Frontend Libraries:
- [jQuery](https://jquery.com) for DOM manipulation
- [d3](https://d3js.org) for creating the parallel coordinates plot
- [Bootstrap](https://getbootstrap.com) for a prettier layout


## Getting started

1. Create virtual environment:
    - with the name ```.env```: ```python -m venv .env```
    - activate the environment: ```source .env/bin/activate``` (unix) *OR* ```.env\Scripts\activate.bat``` (windows)
2. Install required dependencies (available in requirements.txt):
    - ```pip install -r requirements.txt```
3. Run the flask server (```main``` in ```app.py```):
    - ```python app.py```
4. Open the corresponding webapp:
    - Go to ```http://127.0.0.1:8080```


## Attention

BERTscore takes it's time for computation due to creating contextual word embeddings with BERT. Therefore the option to calculate BERTscore is deactivated by default.

### Error handling

There is no proper error handling. Therefore, the app may crash if there are incorrect inputs, which is not indicated in the web app. Therefore, attention should be paid to the console output. As a rule of thumb:
- The calculation time **without** BERTscore should take a maximum of 30 sec.
- The calculation time **with** BERTscore takes about 2 minutes

## Examples

The examples illustrate the benefits and drawbacks of BLEU. They can be found in the dropdown next to the input field.

- Synonyms:
    1. Set parameters:
        - Reference: ```Syn``` $\Rightarrow$ The **quick** brown fox **jumps** over the lazy dog.
        - Candidate: ```Syn``` $\Rightarrow$ The **fast** brown fox **hops** over the lazy dog.
        - Use given weights
    2. Calculate the score
    3. Similar semantic meaning of the sentence, but what about the score?
- Abbreviations:
    1. Set parameters:
        - Reference: ```Abb``` $\Rightarrow$ Example metrics to evaluate machine translations are the WER and the BLEU metric.
        - Candidate: ```Abb``` $\Rightarrow$ Example metrics to evaluate machine translations are the Word Error Rate and the Bilingual Evaluation Understudy metric.
        - Use the common weights
    2. Calculate the score
    3. Sentences have exactly the same semantics, and the score?
- Stop Words vs. Content Words:
    1. Set parameters:
        - Reference: ```StopCont``` $\Rightarrow$ The white cat **plays** with **the** gray cat on the roof.
        - Candidate: ```StopCont1``` $\Rightarrow$ The white cat **fights** with **the** gray cat on the roof.
        - Use given weights
    2. Calculate the score
    3. Set new candidate:
        - Candidate: ```StopCont2``` $\Rightarrow$ The white cat **plays** with **a** gray cat on the roof.
    4. Activate *Keep Result History* and calculate the new score
    5. Compare both results, the meaning of the first two sentences is more different then the meaning of the second two sentences. But what is the score?
- Position of the Word:
    1. Set parameters:
        - Reference: ```Pos``` $\Rightarrow$ **The** white cat plays with **the** gray mouse on the roof.
        - Candidate: ```Pos1``` $\Rightarrow$ **A** white cat plays with **the** gray mouse on the roof.
        - Use given weights
    2. Calculate the score
    3. Set new candidate:
        - Candidate: ```Pos2``` $\Rightarrow$ **The** white cat plays with **a** gray mouse on the roof.
    4. Activate *Keep Result History* and calculate the new score
    5. Compare both results. Both times a definite article is changed to an indefinite article, but at different positions. So the score should be the same?
- Language Independent:
    1. Set parameters:
        - Reference: ```LangInd``` $\Rightarrow$ Der schnelle braune Fuchs springt über den faulen Hund.
        - Candidate: ```LangInd``` $\Rightarrow$ Der flotte braune Fuchs hüpft über den faulen Hund.
        - Use given weights
    2. Calculate the score
    3. Same sentences from Synonyms, but translated to german, is the scorethe same?
- Multiple Ground Truths:
    1. Set parameters:
        - Reference: ```MuGrTr1``` $\Rightarrow$ On the roof of the neighbours house, the playful white cat plays with the clumsy gray cat.
        - Candidate: ```MuGrTr``` $\Rightarrow$ The playful white cat and the clumsy gray cat play on the roof of the neighbours house.
        - Use given weights
    2. Calculate the score
    3. Set new reference and remove old reference:
        - Reference: ```MuGrTr2``` $\Rightarrow$ The white cat and the gray cat play on the neighbours roof.
    4. Activate *Keep Result History* and calculate the new score
    5. Add references ```MuGrTr1```again
    6. Activate *Keep Result History* and calculate the new score
    7. What is the score when comparing all three results?


## References

<a id="1">[1]</a>
Kishore Papineni, Salim Roukos, Todd Ward, and Wei-Jing Zhu. 2002. Bleu: a Method for Automatic Evaluation of Machine Translation. In *Proceedings of the 40th Annual Meeting of the Association for Computational Linguistics, July 6-12, 2002, Philadelphia, PA, USA*. ACL,311–318. [https://doi.org/10.3115/1073083.1073135](https://doi.org/10.3115/1073083.1073135).

<a id="2">[2]</a>
Satanjeev Banerjee and Alon Lavie. 2005. METEOR: An Automatic Metric for MT Evaluation with Improved Correlation with Human Judgments. In *Proceedings of the Workshop on Intrinsic and Extrinsic Evaluation Measures for Machine Translation and/or Summarization@ACL 2005*, Ann Arbor, Michigan, USA, June 29, 2005, Jade Goldstein, Alon Lavie, Chin-Yew Lin, and Clare R. Voss (Eds.). Association for Computational Linguistics, 65–72.

<a id="3">[3]</a>
Tianyi Zhang, Varsha Kishore, Felix Wu, Kilian Q. Weinberger, and Yoav Artzi. 2020. BERTScore: Evaluating Text Generation with BERT. In *8th International Conference on Learning Representations, ICLR 2020, Addis Ababa, Ethiopia, April 26-30, 2020*. OpenReview.net.