const cluster_color_array = 
[['#e41a1c'],
['#377eb8'],
['#4daf4a'],
['#984ea3'],
['#ff7f00'],
['#00cc99'],
['#a65628'],
['#f781bf'],
['#999999']];

$('body').on('mouseenter', '.color-scale-table td', function() {
    const tdClass = $(this).attr('class').match(/[0-9]-[0-9]-cluster/);
    const classNum_resNum = tdClass[0].match(/[0-9]/g)
    addHighlight(classNum_resNum[1], classNum_resNum[0]);
}).on('mouseleave', '.color-scale-table td', function() {
    removeHighlight();
});

let alpha = 0;
let beta = 0;

function isNumber(n) {
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
}

function addHighlight(pcp_class, resultNumber) {
    d3.selectAll(`.pcp-path.num-res-${resultNumber}:not(.pcp-${pcp_class}-cluster)`)
        .transition().duration(200)
        .style('opacity', 0.1);
}

function removeHighlight() {
    d3.selectAll('.pcp-path')
        .transition().duration(200)
        .style('opacity', 1);
}

function pcp_edge_bundling(resultNumber, data, x, y, dims, cluster_centroid) {
    for (let j = 0; j < data.length; j++) {
        const single_line_array = dims.map(p => [x(p), y[p](data[j][p])]);
        let path_first_last_dim = '';
        let p_im1 = single_line_array[0];
        let p_i = single_line_array[0];
        let p_ip1 = single_line_array[0];
        let p_ip2 = single_line_array[0];
        if (single_line_array.length > 1) {
            [, p_ip1] = single_line_array;
        }
        if (single_line_array.length > 2) {
            [, , p_ip2] = single_line_array;
        }

        let x_im1 = p_im1[0];
        let x_i = p_i[0];
        let x_ip1 = p_ip1[0];
        let x_ip2 = p_ip2[0];

        let v_im1 = x_im1 + (x_i - x_im1) / 2;
        let v_i = x_i + (x_ip1 - x_i) / 2;
        let v_ip1 = x_ip1 + (x_ip2 - x_ip1) / 2;

        const q_im1_min = d3.min([p_im1[1], p_i[1]]);
        let q_im1 = [v_im1, q_im1_min + (d3.max([p_im1[1], p_i[1]]) - q_im1_min) / 2];
        const q_i_min = d3.min([p_i[1], p_ip1[1]]);
        let q_i = [v_i, q_i_min + (d3.max([p_i[1], p_ip1[1]]) - q_i_min) / 2];
        const q_ip1_min = d3.min([p_ip1[1], p_ip2[1]]);
        let q_ip1 = [v_ip1, q_ip1_min + (d3.max([p_ip1[1], p_ip2[1]]) - q_ip1_min) / 2];

        let l_i = (q_im1[1] - q_i[1]) / (q_im1[0] - q_i[0]);

        for (let i = 1; i < single_line_array.length; i++) {
            //  definition of all values contained in the calcualtion
            let r_i = (p_i[1] - p_ip1[1]) / (p_i[0] - p_ip1[0]);
            let n_i = (q_i[1] - q_ip1[1]) / (q_i[0] - q_ip1[0]);
            if (!isNumber(n_i)) {
                n_i = (p_i[1] - q_i[1]) / (p_i[0] - q_i[0]);
            }
            if (!isNumber(r_i)) {
                [, r_i] = p_i;
            }

            const c_i = cluster_centroid[data[j].class][i - 1];
            const q_i_prime = (1 - beta) * q_i[1] + beta * c_i;

            const y_i1 = x_i + alpha;
            const z_i1 = v_i - alpha;

            const y_i2 = x_ip1 - alpha;
            const z_i2 = v_i + alpha;

            // f(x) = mx + b
            // calculation of the control points
            const control_yi1_b = -(l_i * p_i[0] - p_i[1]);
            const control_yi1 = [y_i1, l_i * y_i1 + control_yi1_b];

            const control_zi1_b = -(r_i * v_i - q_i_prime);
            const control_zi1 = [z_i1, r_i * z_i1 + control_zi1_b];

            const control_zi2_b = -(r_i * v_i - q_i_prime);
            const control_zi2 = [z_i2, r_i * z_i2 + control_zi2_b];

            const control_yi2_b = -(n_i * p_ip1[0] - p_ip1[1]);
            const control_yi2 = [y_i2, n_i * y_i2 + control_yi2_b];

            // path from P_i to Q_i'
            const path_left = d3.path();
            path_left.moveTo(p_i[0], p_i[1]);
            path_left.bezierCurveTo(control_yi1[0], control_yi1[1], control_zi1[0], control_zi1[1], v_i, q_i_prime);
            path_first_last_dim += path_left;

            // path from Q_i' to P_(i+1)
            const path_right = d3.path();
            path_right.moveTo(v_i, q_i_prime);
            path_right.bezierCurveTo(control_zi2[0], control_zi2[1], control_yi2[0], control_yi2[1], p_ip1[0], p_ip1[1]);
            path_first_last_dim += path_right;

            if (i === (single_line_array.length - 1)) {
                break;
            }

            p_im1 = p_i;
            p_i = p_ip1;
            p_ip1 = p_ip2;
            // p_ip2 = single_line_array[i];
            if (i + 2 < single_line_array.length) {
                p_ip2 = single_line_array[i + 2];
            }

            x_im1 = x_i;
            x_i = x_ip1;
            x_ip1 = x_ip2;
            [x_ip2] = p_ip2;

            v_im1 = v_i;
            v_i = v_ip1;
            v_ip1 = x_ip1 + (x_ip2 - x_ip1) / 2;

            q_im1 = q_i;
            q_i = q_ip1;
            const q_ip1_min2 = d3.min([p_ip1[1], p_ip2[1]]);
            q_ip1 = [v_ip1, q_ip1_min2 + (d3.max([p_ip1[1], p_ip2[1]]) - q_ip1_min2) / 2];

            l_i = n_i;
        }

        const lineClass = data[j].class;
        d3.select(`#pcp${resultNumber}`).select('g').append('path')
            .attr('d', path_first_last_dim)
            .attr('class', `pcp-${lineClass}-cluster pcp-path num-res-${resultNumber}`)
            .style('fill', 'none')
            .style('stroke', cluster_color_array[lineClass])
            .style('stroke-width', 2)
            .style('opacity', 1)
            .on('mouseover', () => addHighlight(lineClass, resultNumber))
            .on('mouseleave', () => removeHighlight());
    }
}

// create array which contains the cluster centroids c_i for each cluster and each dimesnion of this cluster
function calculate_cluster_centroid(data, dims, x, y) {
    let max = d3.max(data, d => d.class);
    if (!isNumber(max)) {
        max = 2;
    }
    const cluster_centroid = [];
    for (let i = 0; i < parseInt(max, 10) + 1; i++) {
        cluster_centroid[i] = [];
        for (let j = 0; j < dims.length - 1; j++) {
            cluster_centroid[i].push(0);
        }
    }
    const class_count = [];
    for (let i = 0; i < parseInt(max, 10) + 1; i++) {
        class_count.push(0);
    }

    for (let i = 0; i < data.length; i++) {
        const cluster = data[i].class;
        class_count[cluster] += 1;
        const single_line_array = dims.map(p => [x(p), y[p](data[i][p])]);
        for (let j = 0; j < single_line_array.length - 1; j++) {
            const p0 = single_line_array[j][1];
            const p1 = single_line_array[j + 1][1];
            cluster_centroid[cluster][j] += (d3.min([p0, p1]) + (d3.max([p0, p1]) - d3.min([p0, p1])) / 2);
        }
    }

    for (let i = 0; i < class_count.length; i++) {
        for (let j = 0; j < dims.length - 1; j++) {
            cluster_centroid[i][j] /= class_count[i];
        }
    }
    return cluster_centroid;
}

class ParallelCoordinatePlot {
    constructor(margin, width, height, resultNumber) {
        this.margin = margin;
        this.width = width - margin.left - margin.right;
        this.height = height - margin.top - margin.bottom;
        this.resultNumber = resultNumber;
    }

    create_parallel_coordinate_plot(data, alpha_slider, beta_slider) {
        d3.select(`#pcp${this.resultNumber}`).remove();
        const svg = d3.select(`#vis_pcp${this.resultNumber}`)
            .append('svg')
            .attr('id', `pcp${this.resultNumber}`)
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('viewBox', `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`)
            .classed('svg-content', true)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        const dims = Object.keys(data[0]).filter(d => d !== 'class');

        const y = {};
        for (let i = 0; i < dims.length; i++) {
            const name = dims[i];
            const extent = d3.extent(data, d => +d[name]);
            const domain = [Math.max(0, extent[0] - 0.02), Math.min(1, extent[1] + 0.02)]
            y[name] = d3.scaleLinear()
                .domain(domain)
                .range([this.height, 0]);
        }

        const x = d3.scalePoint()
            .range([0, this.width])
            .domain(dims);

        const step = x.step();
        const scale_alpha = d3.scaleLinear()
            .domain([0, 1])
            .range([0, step / 4]);

        alpha = scale_alpha(alpha_slider);
        beta = beta_slider;

        const cluster_centroid = calculate_cluster_centroid(data, dims, x, y);

        pcp_edge_bundling(this.resultNumber, data, x, y, dims, cluster_centroid);

        svg.selectAll('axis')
            .data(dims).enter()
            .append('g')
            .attr('transform', d => `translate(${x(d)})`)
            .each(function (d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
            .append('text')
            .style('text-anchor', 'middle')
            .attr('y', -5)
            .text(d => d)
            .style('fill', 'black');
    }
}
