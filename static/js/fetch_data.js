function fetchBertSimilarity(references, candidate) {
    const url = `http://localhost:8080/calculateBertSimilarity`;
    const params = {
        candidate,
        references
    }
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json());
}

function fetchWerScore(references, candidate) {
    const url = `http://localhost:8080/calculateWerScore`;
    const params = {
        candidate,
        references
    }
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json());
}

function fetchMeteorScore(references, candidate) {
    const url = `http://localhost:8080/calculateMeteorScore`;
    const params = {
        candidate,
        references
    }
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json());
}

function fetchBleuScore(references, candidate, weights) {
    const url = `http://localhost:8080/calculateBleuScore`;
    const params = {
        candidate,
        references,
        weights
    }
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json());
}
