window.esJS = window.esJS || {};
window.esJS.dragDropList = function( options ) {
	var self = {
		drag: undefined,
		drop: undefined,
		connectionsMade: [],
		container: ( options.appendTo || $('<div>') ),
		droppableConfig: {
			drop: _onDragDrop,
			activeClass: 'drag-drop-list-active',
			hoverClass: 'drag-drop-list-hover',
			tolerance: 'touch'
		},
		draggableConfig: {
			revert: true,
			snap: true,
			snapMode: 'outer',
			snapTolerance: 0,
			containment: options.appendTo,
			//cursorAt: {right: 10}
		},
		
	};
	
	self.init = function() {
		self.drag = itemList(options.drag, _Renderer_Drag);
		self.drop = itemList(options.drop, _Renderer_Drop);
		
		self.drag.addClass('drag-drop-list-sources')     .appendTo( options.appendTo );
		self.drop.addClass('drag-drop-list-destinations').appendTo( options.appendTo );
		
		self.container
			.on('mouseenter', '.isConnected', function() {
				$(this).data('isConnectedTo').addClass('highlight');
				$(this).addClass('highlight');
			})
			.on('mouseleave', '.isConnected', function() {
				$('.highlight', self.container).removeClass('highlight');
			}
		);
	};
	
	function _Renderer_Drag( content ){
		$(this).draggable( self.draggableConfig ).data('content', content);
		return content;
	}
	function _Renderer_Drop( content ){
		$(this).droppable( self.droppableConfig ).data('content', content);
		return content;
	}
	function _onDragDrop( event, ui ){
		var destData = $(this).data('content');
		var  srcData = $(ui.draggable).data({'isConnectedTo': $(this)}).addClass('isConnected');
		
		window.test = ui;
		
		self.refreshConnections();
		console.log(self.connectionsMade);
		
		self.container.trigger('change');
	}
	
	self.refreshConnections = function(){
		self.connectionsMade = [];
		var elements = self.drag.find('li');
		for(var i=0; i<elements.length; i++) {
			var dragElement = $(elements[i]);
			var connectedTo = dragElement.data('isConnectedTo');
			if( connectedTo )
				self.connectionsMade.push([ dragElement.data('content'), connectedTo.data('content') ]);
		}
	}
	
	self.init();
	return self;
}