window.esJS = window.esJS || {};
window.esJS.dragDropList = function( options ) {
	var self = $.extend({
		drag: undefined,
		drop: undefined,
		renderer_Drag: undefined,
		renderer_Drop: undefined,
		drag_indexKey: undefined,
		drop_indexKey: undefined,
		drag_Elements: {},
		drop_Elements: {},
		oneToOne: false,
		connectionsMade: [],
		container: ( options.appendTo || $('<div>') ),
		droppableConfig: {
			drop: _onDragDrop,
			activeClass: 'drag-drop-list-active',
			hoverClass: 'drag-drop-list-hover',
			tolerance: 'touch'
		},
		draggableConfig: {
			revert: options.oneToOne? true : false,
			snap: true,
			snapMode: 'outer',
			snapTolerance: 0,
			containment: options.appendTo,
			//cursorAt: {right: 10}
		}
	}, options);
	
	self.init = function() {
		self.drag = esJS.itemList(options.drag, _Renderer_Drag);
		self.drop = esJS.itemList(options.drop, _Renderer_Drop);
		
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
	
	self.restoreState = function() {
		var state = self.alreadyConnected;

		for(var i=0; i<state.length; i++){
			var from = self.drag_Elements[ state[i][0][self.drag_indexKey] ];
			var to   = self.drop_Elements[ state[i][1][self.drop_indexKey] ];
			
			_onDragDrop.call(to._element, {}, {draggable: from._element});
		}
	}
	
	function _Renderer_Drag( content ){
		var element = $(this).draggable( self.draggableConfig ).data('content', content);
		content._element = element;
		try{
			self.drag_Elements[ content[self.drag_indexKey] ] = content;
		} catch(e) {}
		try{
			content = self.renderer_Drag.call(element, content);
		} catch(e) {}
		
		return content;
	}
	function _Renderer_Drop( content ){
		var element = $(this).droppable( self.droppableConfig ).data('content', content);
		content._element = element;
		try{
			self.drop_Elements[ content[self.drop_indexKey] ] = content;
		} catch(e) {}
		try{
			content = self.renderer_Drop.call(element, content);
		} catch(e) {}
		return content;
	}
	function _onDragDrop( event, ui ){
		var $this    = $(this);
		var destData = $this.data('content');
		var  srcData = $(ui.draggable).data({'isConnectedTo': $(this)}).addClass('isConnected');
		
		self.refreshConnections();

		self.positionConnectedElement($this, $(ui.draggable));
		self.container.trigger('change');
	}
	
	self.positionConnectedElement = function( container, droppedElement ) {
		var connectedContainer = container.find('.drag-drop-connected');
		if(!connectedContainer[0])
			connectedContainer = $('<ul class="drag-drop-connected">')
				.appendTo(container);
		droppedElement.css({top: 0, left: 0}).addClass('connected-child-node');
		connectedContainer.append(droppedElement);
		
		connectedContainer.position({
			my: "right",
			at: "right",
			of: container
		});
	}
	
	self.refreshConnections = function(){
		self.connectionsMade = [];
		var elements = self.container.find('li, .connected-child-node');
		for(var i=0; i<elements.length; i++) {
			var dragElement = $(elements[i]);
			var connectedTo = dragElement.data('isConnectedTo');
			if( connectedTo )
				self.connectionsMade.push([ dragElement.data('content'), connectedTo.data('content') ]);
		}
	}
	
	self.getConnectedChildren = function( parentIndex ){
		var parent = self.drop_Elements[ parentIndex ];

		for(var i=0; i<self.connectionsMade.length; i++){
			var thisConnection = self.connectionsMade[i];

			if(thisConnection[1][ self.drop_indexKey ] == parentIndex)
				return thisConnection[0];
		}
		
		return {};
	}
	
	
	
	self.init();
	return self;
}
