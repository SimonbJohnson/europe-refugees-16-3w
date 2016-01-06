function generateDash(data,geom){    
    
    function buildReduceAdd(key){
        return function reduceAdd(p, v) {
            v[key].forEach (function(val, idx) {
                p[val] = (p[val] || 0) + 1; //increment counts
            });
            return p;
        }
    }
    
    function buildReduceRemove(key){
        return function reduceRemove(p, v) {
             v[key].forEach (function(val, idx) {
                p[val] = (p[val] || 0) - 1; //decrement counts
            });
            return p;
        }
    }
    
    function reduceInitial() {
           return {};  
    }

    function newAll() {
        var newObject = [];
        for (var key in this) {
            if (this.hasOwnProperty(key) && key !== "all") {
                newObject.push({
                    key: key,
                    value: this[key]
                });
            }
        }
        return newObject;
    };

    function multiFilterHandler(dimension, filters) {
        dimension.filter(null);   
        if (filters.length === 0)
            dimension.filter(null);
        else
            dimension.filterFunction(function (d) {
            for (var i=0; i < d.length; i++) {
                if (filters.indexOf(d[i]) >= 0) return true;
            }
            return false; 
        });
        return filters; 
    }

    var pietip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.data.key+': '+d3.format('0,000')(d.data.value); });
    var rowtip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.key+': '+d3.format('0,000')(d.value); });

    var whatChart = dc.rowChart('#what');
    var languageChart = dc.rowChart('#language');
    var orgTypeChart = dc.pieChart('#orgtype');
    var mapChart = dc.leafletChoroplethChart('#map');

    var cf = crossfilter(data);

    var whatDimension = cf.dimension(function(d){ return d['#service+type']; });
    var languageDimension = cf.dimension(function(d){ return d['#service+language']; });
    var orgTypeDimension = cf.dimension(function(d){ return d['#org+type']; });
    var mapDimension = cf.dimension(function(d){ return d['#country+name']; });

    var whatGroup = whatDimension.groupAll().reduce(buildReduceAdd('#service+type'), buildReduceRemove('#service+type'), reduceInitial).value();
    whatGroup.all = newAll;

    console.log(whatDimension.group().top(Infinity));

    var languageGroup = languageDimension.groupAll().reduce(buildReduceAdd('#service+language'), buildReduceRemove('#service+language'), reduceInitial).value();
    languageGroup.all = newAll;

    var orgTypeGroup = orgTypeDimension.group();    

    var mapGroup = mapDimension.groupAll().reduce(buildReduceAdd('#country+name'), buildReduceRemove('#country+name'), reduceInitial).value();
    mapGroup.all = newAll;

    var all = cf.groupAll();

    whatChart.width($('#what').width()).height(550)
            .dimension(whatDimension)
            .group(whatGroup)
            .elasticX(true)
            //.labelOffsetY(13)
            .colors(['#CCCCCC', '#03a9f4'])
            .colorDomain([0,1])
            .colorAccessor(function(d, i){return 1;})
            .ordering(function(d){ return -d.value })
            .xAxis().ticks(5);

    whatChart.filterHandler(multiFilterHandler);        

    languageChart.width($('#language').width()).height(550)
            .dimension(languageDimension)
            .group(languageGroup)
            .elasticX(true)
            //.data(function(group) {
            //    return group.top(20);
            //})
            //.labelOffsetY(13)
            .colors(['#CCCCCC', '#03a9f4'])
            .colorDomain([0,1])
            .colorAccessor(function(d, i){return 1;})
            .ordering(function(d){ return -d.value })
            .xAxis().ticks(5);

    languageChart.filterHandler(multiFilterHandler); 

    orgTypeChart.width($('#orgType').width()).height(250)
            .dimension(orgTypeDimension)
            .group(orgTypeGroup)
            //.data(function(group) {
            //    return group.top(20);
            //})
            //.labelOffsetY(13)
            .colors(['#CCCCCC', '#03a9f4'])
            .colorDomain([0,1])
            .colorAccessor(function(d, i){return 1;})                     

    dc.dataCount('#count-info')
            .dimension(cf)
            .group(all);

    mapChart.width($('#map').width()).height(250)
            .dimension(mapDimension)
            .group(mapGroup)
            .center([47,15])
            .zoom(3)    
            .geojson(geom)
            .colors(['#CCCCCC', '#03a9f4'])
            .colorDomain([0, 1])
            .colorAccessor(function (d) {
                if(d>0){
                    return 1;
                } else {
                    return 0;
                }
            })           
            .featureKeyAccessor(function(feature){
                return feature.properties['CNTRY_NAME'];
            })
            .popup(function(feature){
                return feature.properties['CNTRY_NAME'];
            })
            .renderPopup(true)
            .featureOptions({
                'fillColor': 'gray',
                'color': 'gray',
                'opacity':0,
                'fillOpacity': 0,
                'weight': 1
            });            

        mapChart.filterHandler(multiFilterHandler);     
            
        dc.dataTable("#data-table")
                .dimension(whatDimension)                
                .group(function (d) {
                    return d[orgTypeDimension];
                })
                .size(650)
                .columns([
                    function(d){
                       return d['#org+name']; 
                    },
                    function(d){
                       return d['#org+type']; 
                    },
                    function(d){
                       return d['#service+description']; 
                    },
                    function(d){
                       return d['#service+type']; 
                    },
                    function(d){
                       return d['#country+name']; 
                    },
                    function(d){
                       return d['#loc+name']; 
                    },
                    function(d){
                       return d['#service+language'];
                    },
                    function(d){
                       return '<a href="'+d['#meta+url']+'" target="_blank">Link</a>'; 
                    }
                ]);            
                               
    dc.renderAll();

    d3.selectAll('g.row').call(rowtip);
    d3.selectAll('g.row').on('mouseover', rowtip.show).on('mouseout', rowtip.hide);

    d3.selectAll('.pie-slice').call(pietip);
    d3.selectAll('.pie-slice').on('mouseover', pietip.show).on('mouseout', pietip.hide);

    map = mapChart.map();
    map.scrollWheelZoom.disable();          
    /*
    var g = d3.selectAll('#hdx-3W-who').select('svg').append('g');
    
    g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', $('#hdx-3W-who').width()/2)
        .attr('y', 200)
        .text('Activities');

    var g = d3.selectAll('#hdx-3W-what').select('svg').append('g');
    
    g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', $('#hdx-3W-what').width()/2)
        .attr('y', 200)
        .text('Activities');

    var g = d3.selectAll('#hdx-3W-status').select('svg').append('g');
    
    g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', $('#hdx-3W-status').width()/2)
        .attr('y', 150)
        .text('Activities');
*/
}

function hxlProxyToJSON(input,headers){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==0){
            keys = e;
        }
        if(headers==true && i>1){
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
        if(headers!=true && i>0){
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

function explodeColumn(data,column){
    data.forEach(function(r){
        r[column] = r[column].replace(', ',',').split(',');
        r[column].forEach(function(d,i){
            if(d.substring(0,1)==' '){
                r[column][i]=d.substring(1);
            }
        });
    });
    return data;
}

$('#intro').click(function(){
    var intro = introJs();
        intro.setOptions({
            steps: [
              {
                element: '#what',
                intro: "Charts can be clicked and interacted with.  When you click an item on a chart if filters the data so the other charts only show data for this item.",
                position: 'right'
              },
              {
                element: '#tabletip',
                intro: "This table lists the data that matches the filters selected on the charts above.",
              },
              {
                element: '#count-info',
                intro: "This number shows the current number of records selected.",
              },
              {
                element: '#reset',
                intro: "Click this button to reset the dashboard.",
              }                            
            ]
        });  
    intro.start();
});

//load 3W data
//https://proxy.hxlstandard.org/data.json?filter02=replace-map&clean-whitespace-tags01=service%2Btype&replace-map-url02=https%3A//docs.google.com/spreadsheets/d/1J_f0bnJEfE87d13_brOyvLjKw4q1xMmHNAHzJc_kmpA/pub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv&filter01=clean&strip-headers=on&force=on&url=https%3A//docs.google.com/spreadsheets/d/1C9fmpzb3VhoGOsCnRAnhbXZNkKd3sVZIN0Ha1VOBQjk/export%3Fformat%3Dcsv%26id%3D1C9fmpzb3VhoGOsCnRAnhbXZNkKd3sVZIN0Ha1VOBQjk%26gid%3D1142452757&clean-toupper-tags01=service%2Btype
var dataCall = $.ajax({ 
    type: 'GET', 
    url: 'https://proxy.hxlstandard.org/data.json?filter02=replace-map&clean-whitespace-tags01=service%2Btype&replace-map-url02=https%3A//docs.google.com/spreadsheets/d/1J_f0bnJEfE87d13_brOyvLjKw4q1xMmHNAHzJc_kmpA/pub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv&filter01=clean&strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/1C9fmpzb3VhoGOsCnRAnhbXZNkKd3sVZIN0Ha1VOBQjk/export%3Fformat%3Dcsv%26id%3D1C9fmpzb3VhoGOsCnRAnhbXZNkKd3sVZIN0Ha1VOBQjk%26gid%3D1142452757&clean-toupper-tags01=service%2Btype',
    dataType: 'json',
});

//load geometry

var geomCall = $.ajax({ 
    type: 'GET', 
    url: 'data/geom.json', 
    dataType: 'json'
});

//when both ready construct 3W

$.when(dataCall, geomCall).then(function(dataArgs, geomArgs){
    var geom = topojson.feature(geomArgs[0],geomArgs[0].objects.geom);
    var data = hxlProxyToJSON(dataArgs[0],false);
    data = explodeColumn(data,'#service+type');
    data = explodeColumn(data,'#service+language');
    data = explodeColumn(data,'#country+name');
    generateDash(data,geom);
});