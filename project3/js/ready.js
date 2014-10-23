//data sctructures

//hospital_infection_percentages is an associative array with keys of
//hospitals and values of percentages of all patients who contract a HAI.
var hospital_infection_percentages = [];
var top_five = [];
var bottom_five = [];

//aggregate_infection_percentage_by_year is an associative array with keys of
//year and values of percentage of patience who contracted a HAI in that year.
var aggregate_infection_percentage_by_year = [];


$(document).ready(function() {
    loadXML();	
});

function loadXML(){
    $.ajax({
        type: "GET",
        url: "data.xml",
        dataType: "xml",
        success: parseXML
    });
}
function parseXML(data){
    $(data).find("row").each(function(idx){ 
        var row = $(this);
        var hospital_name = row.find('hospital_name').text();
        var indicator_name = row.find('indicator_name').text();
        var infections_observed = row.find('infections_observed').text();
        var total_num_patients = row.find('denominator').text();
        var year = row.find('year').text();

        if (infections_observed != '' && total_num_patients != ''){
            if (hospital_name == 'New York State - All Hospitals'){
                //populate aggregate_infection_percentage_by_year to discover how the percentage
                //of hospital aquired infections changed over time.
                var current_percentage;
                var current_indicators_analyzed;
                var year_index = year - 2008; //first data in 2008
                if (aggregate_infection_percentage_by_year[year_index] != null){
                    current_percentage = aggregate_infection_percentage_by_year[year_index][0];
                    current_indicators_analyzed = aggregate_infection_percentage_by_year[year_index][1];
                }else{ 
                    current_percentage = 0;
                    current_indicators_analyzed = 0;
                }
                var new_percentage = (current_percentage * current_indicators_analyzed + (parseInt(infections_observed) / parseInt(total_num_patients))*100) / ++current_indicators_analyzed; 
                aggregate_infection_percentage_by_year[year_index] = [new_percentage, current_indicators_analyzed];
                

            } else{
                //populate hospital_infection_percentages to discover which hospitals
                //had the most hospital aquired infections in the state of NY.
                //add to the running average for the hospital
                var current_percentage;
                var current_indicators_analyzed;
                if (hospital_infection_percentages[hospital_name] != null){
                    current_percentage = hospital_infection_percentages[hospital_name][0];
                    current_infected = hospital_infection_percentages[hospital_name][1];
                    current_total_patients = hospital_infection_percentages[hospital_name][2];
                    current_indicators_analyzed = hospital_infection_percentages[hospital_name][3];
                }else{ 
                    current_percentage = 0;
                    current_total_patients = 0;
                    current_infected = 0;
                    current_indicators_analyzed = 0;
                }
                var new_percentage = (current_percentage * current_indicators_analyzed + ((parseInt(infections_observed) / parseInt(total_num_patients))*100)) / ++current_indicators_analyzed; 
                current_infected += parseInt(infections_observed);
                current_total_patients += parseInt(total_num_patients);

                hospital_infection_percentages[hospital_name] = [new_percentage.toFixed(5), current_infected, current_total_patients, current_indicators_analyzed];
            }
        }
    });
    
    var aggregate_average = 0;
    for (var i = 0; i < aggregate_infection_percentage_by_year.length; i++){
        aggregate_average += aggregate_infection_percentage_by_year[i][0];
    }
    aggregate_average = aggregate_average / aggregate_infection_percentage_by_year.length;
    console.log(aggregate_average);
    //populate fact
    var over_athou = parseInt(aggregate_average*10);
    $('#fact0').append('<h4>' + over_athou + ' in every 1,000 hospital patients <br>have HAIs</h4>');

    var first = aggregate_infection_percentage_by_year[0][0];
    var last = aggregate_infection_percentage_by_year[aggregate_infection_percentage_by_year.length - 1][0];
    console.log(first);
    console.log(last);
    var delta = parseInt((1 - (last/first))*100);
    $('#fact1').append('<h4>HAIs have decreased by ' + delta + '% <br>since 2008</h4>');

    //remove the count element of the hospital_infection_percentages
    //also make table while we're looping
    var table_data = [];
    for (var key in hospital_infection_percentages){ 
        table_data.push([key, hospital_infection_percentages[key][1], hospital_infection_percentages[key][2], hospital_infection_percentages[key][0]]);
        hospital_infection_percentages[key] = hospital_infection_percentages[key][0];
    }

    //sort the hospital_infection_percentages array by value
    hospital_infection_percentages = sortAssociativeArray(hospital_infection_percentages, true);

    //get top and bottom 5
    var fives = getFives(hospital_infection_percentages, true);
    top_five = fives[0];
    bottom_five = fives[1];

    //remove the count element of the aggregate_infection_percentage_by_year
    for (var key in aggregate_infection_percentage_by_year){ 
        aggregate_infection_percentage_by_year[key] = aggregate_infection_percentage_by_year[key][0];
    }
    aggregate_infection_percentage_by_year = sortAssociativeArray(aggregate_infection_percentage_by_year, true);

    // $('#html_bottom').html(htmlBottom);
    initChart1();
    initChart2();
    initChart3();
    $('#table').dataTable({
        "data": table_data,
        "columns" : [
            {'title' : 'Hospital Name' },
            {'title' : 'Number of Patients Infected' },
            {'title' : 'Total Number of Patients' },
            {'title' : 'Percent of Patients Infected' }
        ],
        "order" : [[1, "asc"]]
    });
}

function getFives(arr, is_least_to_greatest){
    var tuples = [];

    for (var key in arr){
        var val = arr[key];
        tuples.push([key, val]);
    }

    var top_five = tuples.slice(0, 5);
    var bottom_five = tuples.slice(-5);
    bottom_five.reverse();
     
    var formatted_top_five = [];
    top_five.forEach(function(e){
        formatted_top_five[e[0]] = e[1]; 
    });

    var formatted_bottom_five = [];
    bottom_five.forEach(function(e){
        formatted_bottom_five[e[0]] = e[1]; 
    });
    return [formatted_top_five, formatted_bottom_five];
}

function sortAssociativeArray(arr, is_least_to_greatest){
    var tuples = [];

    for (var key in arr){
        var val = arr[key];
        tuples.push([key, val]);
    }

    tuples.sort(function(a, b){
        a = a[1]; //get the vals
        b = b[1];
        if (is_least_to_greatest) return b < a;
        return a < b;
    });
    
    var sorted_arr = [];
    tuples.forEach(function(e){
        sorted_arr[e[0]] = e[1]; 
    });
    return sorted_arr;
}

/////////// chart stuff /////////////

var initChart1 = function(){
    var years = [];
    var percentages = [];
    for (var key in aggregate_infection_percentage_by_year){
        var val = aggregate_infection_percentage_by_year[key];
        years.push((parseInt(key) + 2008).toString()); //first data is 2008
        percentages.push(val);
    }

    $('#date_chart').highcharts({
        chart: {
            type: 'line',
            backgroundColor:'rgba(255,255,255, 0.3)',
            position: {  
                 align: 'left', 
                 verticalAlign: 'bottom', 
                 x: 10, 
                 y: -10 
            }
        },
        title: {
            text: 'Hospital Aquired Illnesses in New York State by Year',
            style: {
                'font-family': 'Postoni, sans-serif',
                'font-size': '12pt'
            }
        },
        xAxis: {
            categories: years
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Percentages'
            }
        },
        legend: {
            reversed: false
        },
        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },
        exporting: {  
            enabled: false 
        },
        series: [{
            name: 'Percentage of Patients in Given Year',
            data: percentages,
            color: '#88A1A8'
        }
    ]
    });
}

var initChart2 = function(){
    var hospitals = [];
    var percentages = [];
    for (var key in bottom_five){
        var val = bottom_five[key];
        hospitals.push(key); //first data is 2008
        percentages.push(parseFloat(val));
    }
    $('#hospitals_chart1').highcharts({
        chart: {
            type: 'bar',
            backgroundColor:'rgba(255,255,255, 0.3)',
            position: {  
                 align: 'left', 
                 verticalAlign: 'bottom', 
                 x: 10, 
                 y: -10 
            }
        },
        title: {
            text: 'Highest Percentage of Hospital Aquired Illnesses (Worst Hospitals)',
            style: {
                'font-family': 'Postoni, sans-serif',
                'font-size': '12pt'
            }
        },
        xAxis: {
            categories: hospitals,
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Percentages',
                align: 'high',
                style: {
                    'font-family': 'Postoni, sans-serif',
                    'font-size': '8pt'
                }
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            valueSuffix: ' percent'
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        credits: {
            enabled: false
        },
        exporting: {  
            enabled: false 
        },
        series: [{
            name: 'Percentages 2008-2012',
            data: percentages,
            color: '#88A1A8'
        }]
    });
}

var initChart3 = function(){
    var hospitals = [];
    var percentages = [];
    for (var key in top_five){
        var val = top_five[key];
        hospitals.push(key); //first data is 2008
        percentages.push(parseFloat(val));
    }
    $('#hospitals_chart2').highcharts({
        chart: {
            type: 'bar',
            backgroundColor:'rgba(255,255,255, 0.3)',
            position: {  
                 align: 'left', 
                 verticalAlign: 'bottom', 
                 x: 10, 
                 y: -10 
            }
        },
        title: {
            text: 'Lowest Percentage of Hospital Aquired Illnesses (Best Hospitals)',
            style: {
                'font-family': 'Postoni, sans-serif',
                'font-size': '12pt'
            }
        },
        xAxis: {
            categories: hospitals,
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Percentages',
                align: 'high',
                style: {
                    'font-family': 'Postoni, sans-serif',
                    'font-size': '8pt'
                }
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            valueSuffix: ' percent'
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        credits: {
            enabled: false
        },
        exporting: {  
            enabled: false 
        },
        series: [{
            name: 'Percentages 2008-2012',
            data: percentages,
            color: '#88A1A8'
        }]
    });
}

