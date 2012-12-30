window.lineupEditor = (function(){
	var self = {
		state: false,
		performers: false,//[{"Performer.StageName":"Vitamin E","Performer.ID":1,"Person.ID":1,"Person.Name_First":"Eric","Person.Name_Last":"Seastrand"},{"Performer.StageName":"The Vinyl Ninja","Performer.ID":2,"Person.ID":2,"Person.Name_First":"Tosh","Person.Name_Last":"Smith"},{"Performer.StageName":"DJ Blaze","Performer.ID":3,"Person.ID":3,"Person.Name_First":"Jake","Person.Name_Last":"Hunter"},{"Performer.StageName":"DJ Ekzercyst","Performer.ID":4,"Person.ID":4,"Person.Name_First":"Christopher","Person.Name_Last":"Rodgers"},{"Performer.StageName":"Mad Dog Jackson","Performer.ID":5,"Person.ID":5,"Person.Name_First":"Mike","Person.Name_Last":"Broadcast"},{"Performer.StageName":"Diamond Eyes","Performer.ID":6,"Person.ID":6,"Person.Name_First":"Kristin","Person.Name_Last":"Broadcast"},{"Performer.StageName":"DJ Sh@d0w","Performer.ID":7,"Person.ID":7,"Person.Name_First":"Dylan","Person.Name_Last":"Brown"}],
		timeslots : [],
		indexKey_performers: 'Performer.ID',
		indexKey_timeslots: 'index',
		eventId: 1,
		stageId: false
	};
	var eventInfo = self.eventInfo = {"Event.Name":"Tosh Whirled Wednesdays","Event.Time_Start":"2012-09-26 21:00:00","Event.Time_End":"2012-09-27 02:00:00","Event.MOTD":null,"Location.Name":"Numbers","Location.Address_Street":"300 Westheimer","Location.Address_Zip":77006,"Location.Address_City":"Houston","Location.Address_State":"TX","Location.Website":"http:\/\/numbersnightclub.com","Location.GoogleMapsID":"2098933391966363827"};
	self.timeSlots_Object = _timeSlots(eventInfo['Event.Time_Start'], eventInfo['Event.Time_End']) ;
	
	self.init = function(){
		self.container = $('.event-lineup-editor');
		
		self.initButtonPanel();
		
		self.dragDropContainer = $('<div>').addClass('event-lineup-editor-dragdrop').appendTo(self.container);
		
		
		self.loadStages();
		self.loadPerformers();
		self.loadExisting();
	};
	
	self.initButtonPanel = function(){
		self.buttonPanel = $('<div>').addClass('event-lineup-buttons').prependTo(self.container);
		
		$('<button>').appendTo(self.buttonPanel)
			.text('Save')
			.on('click', self.saveTimeslots )
		;
		$('<button>').appendTo(self.buttonPanel)
			.text('Reset')
			.on('click', function(){
				self.setNumberOfTimeslots(self.slotCountInput.val());
				self.refresh();
			})
		;
		$('<button>').appendTo(self.buttonPanel)
			.text('Add New DJ')
			.on('click', function(){
				_event_Form_Performer_Create( self.loadPerformers );
			})
		;
		self.slotCountInput = $('<input>').attr({type: 'number', value: 5})
		$('<span>').appendTo(self.buttonPanel)
			.append(
				$('<label>').text('Number of slots'),
				self.slotCountInput
			)
		;
		self.stageSelect = $('<select>').on('change', _stageSelect_onChange);
		$('<span>').appendTo(self.buttonPanel)
			.append(
				$('<label>').text('Which Stage'),
				self.stageSelect
			)
		;
		
	}
	
	function _stageSelect_onChange() {
		self.stageId = $(this).val();
		
		self.loadExisting();
	}
	
	self.loadPerformers = function() {
		$.ajax({
			url: '?action=Performer_Get',
			dataType: 'JSON',
			success: _loadPerformers_AFTER
		});
	};
	function _loadPerformers_AFTER( resp ) {
		self.performers = resp.result;
		
		_initIfLoaded();
	}
	
	self.loadStages = function() {
		$.ajax({
			url: '?action=Event_Stage_Get',
			data: {eventId: self.eventId},
			dataType: 'JSON',
			success: _loadStages_AFTER
		});
	};
	function _loadStages_AFTER( resp ) {
		self.stages = resp.result;
		self.stageSelect.empty();
		for(var i=0; i<self.stages.length; i++) {
			$('<option>').appendTo( self.stageSelect )
				.attr('value', self.stages[i]['Event_Stage.ID'] )
				.text( self.stages[i]['Event_Stage.Name'] )
			;
		}
		self.stageSelect[0].selectedIndex = 0;
		self.stageSelect.trigger('change');
	}
	
	self.loadExisting = function() {
		var postData = {eventId: self.eventId};
		if( self.stageId )
			postData.stageId = self.stageId;
		
		$.ajax({
			url: '?action=Event_TimeSlot_Get',
			dataType: 'JSON',
			data: postData,
			success: _loadExisting_AFTER
		});
	};
	function _loadExisting_AFTER( resp ) {
		self.state = resp.result;
		
		_initIfLoaded();
	}
	
	function _initIfLoaded() {
		if(self.performers && self.state){
		
			self.load();
			self.refresh();
		}
	}
	
	self.renderPreview = function(){
		var container = $('.event-lineup').empty();
		
		self.flyerPreviewLineup = window.esJS.itemList(self.state, function( item ){
			var strftimeString  = '%I:%M %p';
			var formattingRegex = /(^0)|(:00 ??)/g;
			var prettyStartTime = new Date(Date.parse( item['Event_TimeSlot.Time_Start'] ))
						.strftime(strftimeString).replace(formattingRegex, '');
			
			$(this).append(
			$('<div class="event-lineup-performer">').append(
				$('<div class="event-lineup-performer-name">')
					.text(item['Performer.Name'] || 'TBA'),
				$('<div class="event-lineup-performer-start-time">')
					.text( prettyStartTime ),
				$('<a>')
					.attr({'href': 'http://facebook.com/'+ item['Performer.URL_Facebook'], target: '_BLANK'})
					.append('<img src="img/Facebook-icon.png">')
			) );
		});
		
		container.append(self.flyerPreviewLineup);
		
	}
	
	self.setNumberOfTimeslots = function( howMany ) {
		self.timeSlots_Object.preset(howMany);
		
		self.timeslots = self.timeSlots_Object.timeSlots;
		
		self.initDragDropList();
	};
	
	self.initDragDropList = function(){
		self.dragDropContainer.empty();
		self.dragDropList = window.esJS.dragDropList({
			drag: self.performers,
			drag_indexKey: self.indexKey_performers,
			drop: self.timeslots,
			drop_indexKey: self.indexKey_timeslots,
			alreadyConnected: self.alreadyConnected,
			appendTo: self.dragDropContainer,
			renderer_Drag: _renderer_Drag,
			renderer_Drop: _renderer_Drop
			//onChange: self.refresh
		});
		
		self.dragDropList.container.bind('change', self.refresh);
	};

	self.refresh = function(){
		var input = self.dragDropList.connectionsMade;
		self.state = [];
		/*
		for(var i=0; i<input.length; i++) {
			var time = input[i][1];
			var performer = input[i][0];
			
			self.state.push({
				"Event_TimeSlot.Time_Start": time.start.strftime('%Y-%m-%d %T'),
				"Event_TimeSlot.Time_End": time.end.strftime('%Y-%m-%d %T'),
				"Event_TimeSlot.Performer_ID": performer['Performer.ID'],
				"Performer.StageName": performer['Performer.StageName'],
				"Event_TimeSlot.Event_ID": 1,
			});
		}
		*/
		for(var i=0; i<self.timeslots.length; i++) {
			var time = self.timeslots[i];
			var performer = self.dragDropList.getConnectedChildren( i+1 );
			
			self.state.push({
				"Event_TimeSlot.Time_Start": time.start.strftime('%Y-%m-%d %T'),
				"Event_TimeSlot.Time_End": time.end.strftime('%Y-%m-%d %T'),
				"Event_TimeSlot.Performer_ID": performer['Performer.ID'] || null,
				"Performer.Name": performer['Performer.Name'] || null,
				"Event_TimeSlot.Event_ID": 1,
				"Event_TimeSlot.Event_Stage_ID": self.stageId
			});
		}
		
		self.state.sort(function(a,b){
			a = new Date( Date.parse( a['Event_TimeSlot.Time_Start']) );
			b = new Date( Date.parse( b['Event_TimeSlot.Time_Start']) );
			
			if( a > b )
				return 1;
			else
				return -1;
		});
		
		self.renderPreview();
		
	};
	
	self.load = function(  ) {
		self.alreadyConnected = [];
		self.timeslots = [];
		var Event_TimeSlots = self.state;
		
		for(var i=0; i<Event_TimeSlots.length; i++) {
			var slot = {};
			var performer = {};
			
			performer[ self.indexKey_performers ] = Event_TimeSlots[i]['Event_TimeSlot.Performer_ID'];
			slot[ self.indexKey_timeslots ] = i+1;
			self.alreadyConnected.push([performer, slot]);
			
			var timeStart_MS = Date.parse( Event_TimeSlots[i]['Event_TimeSlot.Time_Start'] );
			var timeEnd_MS   = Date.parse( Event_TimeSlots[i]['Event_TimeSlot.Time_End'] );
			self.timeslots.push({
				start: new Date( timeStart_MS ),
				end  : new Date( timeEnd_MS ),
				duration: timeEnd_MS - timeStart_MS,
				index: i+1
			});
	
		}
		
		//self.dragDropList.alreadyConnected = self.alreadySet;
		self.initDragDropList();
		self.dragDropList.restoreState();
	}

	function _renderer_Drag( dataObject ) {
		this.attr('title', dataObject["Person.Name_First"] + ' ' + dataObject["Person.Name_Last"] );
		return dataObject["Performer.Name"];
	}
	
	function _renderer_Drop( dataObject ) {
		var strftimeString  = '%I:%M %p';
		var formattingRegex = /(^0)|(:00 ??)/g;
		return dataObject.start.strftime(strftimeString).replace(formattingRegex, '') + '-' + dataObject.end.strftime(strftimeString).replace(formattingRegex, '');
	}
	
	$(self.init);
	
	self.saveTimeslots = function() {
		var toPost = [];
		
		for( var i=0; i<self.state.length; i++ ){
			var thisSlot = self.state[i];
			toPost.push({
				eventId     : thisSlot['Event_TimeSlot.Event_ID'],
				performerId : thisSlot['Event_TimeSlot.Performer_ID'],
				stageId     : thisSlot['Event_TimeSlot.Event_Stage_ID'],
				start       : thisSlot['Event_TimeSlot.Time_Start'],
				end         : thisSlot['Event_TimeSlot.Time_End']
			});
		}
		
		$.ajax({
			url: '?action=Event_TimeSlot_SetAll',
			type: 'POST',
			data: { eventId: self.eventId, stageId: self.stageId, timeslots: JSON.stringify(toPost) },
			success: function( resp ) {
				console.log( resp );
			}
		});
			
	}
	
	function _timeSlots( eventStart, eventEnd ) {
		var self = {
			timeSlots: [],
			eventInfo: {}
		};
		
		self.setEventTime = function( start, end ){
			self.eventInfo['start'] = new Date(Date.parse(start)).getTime();
			self.eventInfo['end']   = new Date(Date.parse(end)).getTime();
			self.eventInfo['length']= self.eventInfo['end'] - self.eventInfo['start'];

		};
		if(eventStart && eventEnd) self.setEventTime(eventStart, eventEnd);
		
		self.preset = function( divideIntoHowMany ){
			var timeForEachSlot = self.eventInfo['length'] / divideIntoHowMany;
			timeForEachSlot = Math.round(timeForEachSlot);
			self.timeSlots = [];
			for(var i=0; i<divideIntoHowMany; i++) {
				self.timeSlots.push( {
					start: new Date( self.eventInfo.start + (timeForEachSlot * (i    )) ),
					end  : new Date( self.eventInfo.start + (timeForEachSlot * (i +1 )) ),
					duration: timeForEachSlot,
					index: i+1
				});
			}
			
		};
		
		
		self.sort = function(){
			self.timeSlots.sort( _sortFunc );
		}
		
		function _sortFunc(a, b) {
			console.log(a.start,b.start, a.start == b.start);
			if( a.start == b.start )
				return 0;
			if( a.start <  b.start )
				return -1;
			else
				return 1;
		}
		
		return self;
	}
	
	return self;
}());

function _event_WebFlyer_Create( eventId ) {
	var flyerContainer = $('<div>').addClass('event-flyer-preview');
	
	function loadLineup() {
		var postData = {eventId: self.eventId};
		
		$.ajax({
			url: '?action=Event_TimeSlot_Get',
			dataType: 'JSON',
			data: postData,
			success: _loadExisting_AFTER
		});
	};
	function _loadExisting_AFTER( resp ) {
		renderFlyer( resp.result );
	}
	function renderFlyer( lineup ) {
		var container = $('.event-lineup', flyerContainer).empty();
		if(!container[0])
			container = $('<div>').addClass('event-lineup').appendTo(flyerContainer);
		
		var lineupList = window.esJS.itemList(lineup, _renderer_Performer);
		
		container.append(lineupList);
	}
	
	function _renderer_Performer( item ){
		var strftimeString  = '%I:%M %p';
		var formattingRegex = /(^0)|(:00 ??)/g;
		var prettyStartTime = new Date(Date.parse( item['Event_TimeSlot.Time_Start'] ))
					.strftime(strftimeString).replace(formattingRegex, '');
		
		$(this).append(
		$('<div class="event-lineup-performer">').append(
			$('<div class="event-lineup-performer-name">')
				.text(item['Performer.Name'] || 'TBA'),
			$('<div class="event-lineup-performer-start-time">')
				.text( prettyStartTime ),
			$('<a>')
				.attr({'href': 'http://facebook.com/'+ item['Performer.URL_Facebook'], target: '_BLANK'})
				.append('<img src="img/Facebook-icon.png">')
		) );
	}
	
	loadLineup();
	
	return flyerContainer;
}

function _event_Form_Performer_Create( afterCreate ) {
	var container = $('<div>');
	
	var firstName = $('<input>').attr({type: 'text'})
		$('<div>').appendTo(container)
			.append(
				$('<label>').text('First Name'),
				firstName
			)
		;
	var lastName = $('<input>').attr({type: 'text'})
		$('<div>').appendTo(container)
			.append(
				$('<label>').text('Last Name'),
				lastName
			)
		;
	var djName = $('<input>').attr({type: 'text'})
		$('<div>').appendTo(container)
			.append(
				$('<label>').text('DJ Name'),
				djName
			)
		;
	var facebookPage = $('<input>').attr({type: 'text'})
		$('<div>').appendTo(container)
			.append(
				$('<label>').text('Facebook Page'),
				facebookPage
			)
		;
	
	var SUBMIT = $('<button>').appendTo(container).text('Add Performer').on('click', function(){
		$.ajax({
			url: '?action=Performer_Create_WithNewPerson',
			dataType: 'JSON',
			data: {
				nameFirst: firstName.val(),
				nameLast : lastName.val(),
				performerName: djName.val(),
				facebookUrl: facebookPage.val()
			},
			success: function(){
				container.dialog('hide');
				
				if(afterCreate)
					afterCreate();
			}
		});
	});
	
	container.dialog({title: "New Performer"});
}

