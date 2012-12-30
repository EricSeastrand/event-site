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
		var stages = {};
		var timeslots = resp.result;
		for(var i=0; i<timeslots.length; i++) {
			var thisStageName = timeslots[i]['Event_Stage.Name'];
			if(!thisStageName) continue;
			
			stages[ thisStageName ] = stages[ thisStageName ] || [];
			
			stages[ thisStageName ].push( timeslots[i] );
		}
		console.log(stages);
		renderFlyer( stages );
	}
	function renderFlyer( stages ) {
		var container = $('.event-lineup', flyerContainer).empty();
		if(!container[0])
			container = $('<div>').addClass('event-lineup').appendTo(flyerContainer);
		$('.event-MOTD').appendTo(container);
		
		var lineupContainer = $('<div>').addClass('event-flyer-lineup-container');
		container.append(lineupContainer);
		
		for( var stageName in stages ){
			var lineupList = window.esJS.itemList( stages[stageName], _renderer_Performer);
			lineupContainer.append(
				$('<div class="event-flyer-stage-lineup">').append(
					$('<h2>').append( $('<span>').text(stageName) ),
					lineupList
				)
			);
		}
		
		
		
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
				.append('<img src="img/Facebook-icon.png">'),
			$('<a>').addClass('event-lineup-performer-soundcloud')
				.attr({'href': 'http://Soundcloud.com/'+ item['Performer.URL_Soundcloud'], target: '_BLANK'})
				.append('<img src="img/soundcloud-icon.png">')
		) );
	}
	
	loadLineup();
	
	return flyerContainer;
}
