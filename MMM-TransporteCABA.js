/* global Module */

/* Magic Mirror
 * Module: MMM-TransporteCABA
 *
 * By 
 * MIT Licensed.
 */

Module.register("MMM-TransporteCABA", {
  busesInfo: [],
  arrBuses: [],
  defaults: {
    header: 'Transporte CABA',
    apiKeys: [{client_id: '', client_secret: ''}],
    useBuses: false,
    buses: [
      {
        line: ''
      }
    ],
    mmLocation: [ -34.6, -58.433333 ], // [ latitude, longitude ]
    updateInterval: 30000, // update interval in milliseconds
    initialLoadDelay: 1000, // initial delay for the module to be loaded in milliseconds
    fadeSpeed: 4000,
    infoClass: 'big' // small, medium or big
  },

  getStyles: function() {
    return ["MMM-TransporteCABA.css"];
  },

  start: function() {
    Log.info("Starting module: " + this.name);
    this.scheduleUpdate(this.config.initialLoadDelay);
  },

  scheduleUpdate: function(delay) {
    const nextLoad = (typeof delay !== "undefined" && delay >= 0) ? delay : this.config.updateInterval;
    setTimeout(() => {
      this.busesInfo = []; // prevent redrawing twice the same info
      this.arrBuses = []; // prevent redrawing twice the same info
      this.sendSocketNotification('GET_INFO', this.config.apiKeys);
			this.scheduleUpdate();
	 	}, nextLoad);

    /*
    this.intervalID = setInterval(function() {
      this.busesInfo = [] // prevent redrawing twice the same info
      this.config.buses.forEach(info => {
        this.sendSocketNotification('GET_INFO', info);
      })
    }, nextLoad)
    */
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "BUS_RESULT") {
      if (payload.length !== 0) { // update DOM only if it's needed
        this.busesInfo=[...payload];
        this.updateDom(this.config.fadeSpeed);
      }
    }
  },

  getHeader: function() {
    return this.config.header
  },

  getDom: function() {
    var wrapper = document.createElement("table")
    if (Object.entries(this.busesInfo).length === 0) return wrapper

    wrapper.className = 'transportecaba ' + this.config.infoClass
    this.busesInfo.forEach(bus => {
      var route_short_name = bus.route_short_name;
      var trip_headsign = bus.trip_headsign;
      var nameToUse = "arr"+route_short_name+trip_headsign;
      if(!this.arrBuses.some(e => e.variableName == nameToUse))
      this.arrBuses.push({variableName: nameToUse, variableValue:[bus]});
      else{
        index = this.arrBuses.findIndex(e => e.variableName == nameToUse);
        this.arrBuses[index].variableValue.push(bus);
      }
      if(this.config.useBuses === true){
        arrTemp = [];
        this.config.buses.forEach(busName => {
          if(this.arrBuses.some(e => e.variableName.includes(busName.line))){
            index = this.arrBuses.findIndex(e => e.variableName.includes(busName.line));
            arrTemp.push(this.arrBuses[index]);
          }
        })
        this.arrBuses = arrTemp;
      }
    })
    this.arrBuses.forEach(bus => {
      let nearBuses = bus.variableValue;
      let first = true
      for (let key in nearBuses) {
        let value = nearBuses[key]
        let busRow = document.createElement("tr"),
          busSymbolCell = document.createElement("td"),
          busLineCell = document.createElement("td"),
          busDistanceCell = document.createElement("td"),
          busMinutesCell = document.createElement("td");
        
        if (value.length == 1) busRow.className = 'last' // some lines could have only 1 arrival time
        else busRow.className = first ? '' : 'last'
        busSymbolCell.innerHTML = first ? '<i class="fas fa-bus"></i>' : ''
        busSymbolCell.className = 'bus-symbol'
        busLineCell.innerHTML = first ? value['route_short_name'] : ''
        busLineCell.className = 'bus-line'
        busDistanceCell.innerHTML = this.distanceToMM(value['latitude'], value['longitude'])
        busDistanceCell.className = 'bus-distance number'
        busMinutesCell.innerHTML = value['speed'] + ' min'
        let proximityClass = ''
        if (value['speed'] <= 3 ) {
          proximityClass = 'arriving'
        } else if(value['speed'] > 3 && value['speed'] <= 5) {
          proximityClass = 'close'
        } else proximityClass = 'faraway'
       
        busMinutesCell.className = proximityClass + ' number'
        
        busRow.appendChild(busSymbolCell)
        busRow.appendChild(busLineCell)
        busRow.appendChild(busDistanceCell)
        busRow.appendChild(busMinutesCell)

        wrapper.appendChild(busRow)

        first = false
      }
    })
		return wrapper
  },
  // distance from the upcoming bus to where my MagicMirror is located
  distanceToMM: function(lat2,lon2) {
    lat1 = this.config.mmLocation[0]
    lon1 = this.config.mmLocation[1]

    var R = 6371; // km (change this constant to get miles)
    var dLat = (lat2-lat1) * Math.PI / 180;
    var dLon = (lon2-lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    if (d>1) return Math.round(d)+"km";
    else if (d<=1) return Math.round(d*1000)+"m";
    return d;
  }

  /*
  https://docs.magicmirror.builders/development/core-module-file.html#suspend
  used in combination with ModuleScheduler in order to halt the timers

  suspend: function() {
    window.clearInterval(this.intervalID)
  },

  resume: function() {
    this.scheduleUpdate(this.config)
  },
  */
})

