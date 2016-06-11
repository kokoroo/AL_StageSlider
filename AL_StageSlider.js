/*
AL_StageSlider
Desc : page slider for stage
Author : Albert Lee
Ver : 0.1 @2015/04/05
 */

AL_StageSlider = function(args){
	var _this = this;

	_this.init(args);
	_this.resize();
	_this.attach_events();
}

AL_StageSlider.prototype.default_args = {
	stage_sel : '#stage',
	page_con_sel : '.page_con',
	page_sel : '.page',
	active_page_sel : '.active_page',
	threshold_ratio : 0.1,
	animate_type : 'ease',
	animate_duration : 200,
	axis : 'y',
	on_page_change: null,
	on_page_change_done: null,
}

AL_StageSlider.prototype.init = function(args){
	var _this = this;

	$.extend( _this,_this.default_args,args );
	_this.$stage = $(_this.stage_sel).eq(0);
	_this.$page_con = _this.$stage.find(_this.page_con_sel);
	_this.$pages = _this.$stage.find(_this.page_sel);

	_this.on_drag = false;
	_this.cur_page_index = 0;
	_this.pages_cc = _this.$pages.length;


  if( is_touch_device() ){
    _this.touch_start_eventname = 'touchstart';
    _this.touch_end_eventname = 'touchend';
    _this.touch_move_eventname = 'touchmove';
  }else{
    _this.touch_start_eventname = 'mousedown';
    _this.touch_end_eventname = 'mouseup';
    _this.touch_move_eventname = 'mousemove';
  }


  _this.$pages.each( function(i,el){
  	$page = $(el);
  	$page.data( 'idx',i );
  	if( $page.is(_this.active_page_sel) ){
  		_this.cur_page_index = i
  	}
  } );

	// if( this.$pages.filter(active_page_sel).length ){
	// 	this.$pages.each(function(){

	// 	});
	// }else{
	// 	this.active_index = 0
	// }

}

AL_StageSlider.prototype.resize = function(){
	var _this = this;
	console.log('resize');
	if( _this.axis == 'y' ){
		_this.stage_h = _this.$stage.height();
		_this.threshold = _this.stage_h * _this.threshold_ratio;
	}else{
		_this.stage_w = _this.$stage.width();
		_this.threshold = _this.stage_w * _this.threshold_ratio;
	}
	_this.position_pages();
	_this.reset_page( true );
}

AL_StageSlider.prototype.position_pages = function(){
	var _this = this;
	_this.$pages.each(function(index) {
		if( _this.axis == 'y' ){
			$(this).css_t3d( 0 , _this.stage_h * index );
		}else{
			$(this).css_t3d( _this.stage_w * index , 0 );
		}
	});
}

AL_StageSlider.prototype.drag_start = function(event){
	
	// console.log('drag_start');

	var _this = this;
	
	event.stopPropagation();

	_this.on_drag = true;
  _this.con_animation(false);

  _this.start_d_x = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
  _this.start_d_y = event.changedTouches ? event.changedTouches[0].clientY : event.clientY;

  _this.page_con_start_t3d = _this.$page_con.css_t3d();
}

AL_StageSlider.prototype.drag_end = function(event){
	
	// console.log('drag_end');
	
	var _this = this;
	
	event.stopPropagation();
  
	_this.on_drag = false;

	if( _this.axis == 'y' ){
		var y = event.changedTouches ? event.changedTouches[0].clientY : event.clientY;
		var diff_y = y - _this.start_d_y;

		if( Math.abs(diff_y) >= _this.threshold ){
			if ( diff_y > 0 ){
				_this.prev();
			}else{
				_this.next();
			}
		}else{
			_this.reset_page();
		}
	}else{
		var x = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
		var diff_x = x - _this.start_d_x;

		if( Math.abs(diff_x) >= _this.threshold ){
			if ( diff_x > 0 ){
				_this.prev();
			}else{
				_this.next();
			}
		}else{
			_this.reset_page();
		}
	}
}



AL_StageSlider.prototype.drag_move = function(event){
	// console.log('drag_move');
	var _this = this;
	event.stopPropagation();
	event.preventDefault();

  if( _this.on_drag ){
  	if( _this.axis == 'y' ){
  		var y = event.changedTouches ? event.changedTouches[0].clientY : event.clientY;
  		var diff_y = y - _this.start_d_y;
  		var pos_y = _this.page_con_start_t3d.y + diff_y;
			_this.$page_con.css_t3d( null,pos_y );
  	}else{
  		var x = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
  		var diff_x = x - _this.start_d_x;
  		var pos_x = _this.page_con_start_t3d.x + diff_x;
			_this.$page_con.css_t3d( pos_x );
  	}

  	var x = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;

  }

}

AL_StageSlider.prototype.con_animation = function( enable ){
	var _this = this;
	if( enable ){
		_this.$page_con.css_transition( _this.animate_duration );
	}else{
		_this.$page_con.css_transition( 0 );
	}
}

AL_StageSlider.prototype.goto_page = function( idx,_no_animate ){
	var _this = this;
	var no_animate = _no_animate || false;
  if( _this.axis == 'y' ){
  	var tar_y = - _this.stage_h * idx;
  	if( no_animate ){
  		_this.con_animation(false);
  	}else{
  		_this.con_animation(true);
  	}
  	_this.$page_con.css_t3d( null,tar_y );
  }else{
  	var tar_x = - _this.stage_w * idx;
  	if( no_animate ){
  		_this.con_animation(false);
  	}else{
  		_this.con_animation(true);
  	}
  	_this.$page_con.css_t3d( tar_x );
  }
  if( _this.cur_page_index != idx ){
		if( typeof _this.on_page_change == 'function' ){
			_this.on_page_change.apply( _this,[idx,_this.$pages.eq(idx),_this.cur_page_index,_this.$pages.eq(_this.cur_page_index)] );
		}
		if( typeof _this.on_page_change_done == 'function' ){
			var _idx = idx;
			var _$page = _this.$pages.eq(idx);
			var _old_idx = _this.cur_page_index
			var _old_$page = _this.$pages.eq(_this.cur_page_index)
			window.setTimeout( function(){
				_this.on_page_change_done.apply( _this,[_idx,_$page,_old_idx,_old_$page] );
			},_this.animate_duration )
		}
		_this.cur_page_index = idx;
		_this.$pages.eq(idx).addClass(_this.active_page_sel).siblings('.page').removeClass(_this.active_page_sel);
  }


  
}

AL_StageSlider.prototype.reset_page = function( _no_animate ){
	var _this = this;
	var no_animate = _no_animate || false;
	_this.goto_page(_this.cur_page_index , no_animate);
}

AL_StageSlider.prototype.prev = function(){
	var _this = this;
	var next_idx = _this.cur_page_index - 1;
	next_idx = next_idx < 0 ? 0 : next_idx;
	_this.goto_page( next_idx );
}

AL_StageSlider.prototype.next = function(){
	var _this = this;
	var next_idx = _this.cur_page_index + 1;
	next_idx = next_idx >= _this.pages_cc ? (_this.pages_cc - 1) : next_idx;
	_this.goto_page( next_idx );
}

AL_StageSlider.prototype.attach_events = function(){
	var _this = this;

	_this.$stage.on( _this.touch_start_eventname,function(){
		return _this.drag_start(event);
	} );

	_this.$stage.on( _this.touch_end_eventname,function(){
		return _this.drag_end(event);
	} );

	_this.$stage.on( _this.touch_move_eventname,function(event){
		return _this.drag_move(event);
	} );

	$(window).on( 'resize',function(){
		_this.resize();
	} );


}


// AL_StageSlider.prototype.init = function(){
	
// }












