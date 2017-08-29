/*
 *	only support AMD
 *
 */

(function(factory){
	"use strict";
	if(typeof exports === "object" && typeof module !== "undefined") {
		factory(require('react'),require('react-dom'), exports, require('style-loader!css!../../css/widget/dropDown.css'));
	}
	else if (typeof define === "function" && define.amd) {

		define(['react', 'reactDOM','exports','css!../../css/widget/dropDown.css'], function(React, ReactDOM, exports){
			return exports.DropDown = factory(React, ReactDOM, exports, require);
		});
	}
	else {
		factory();
	}
}(function(React, ReactDOM, exports){
	"use strict";
	var __key = 0;

	var DropDown = React.createClass({
		__cid: 0,
		getInitialState:function(){
			return {items:[],
				isShow: false};
		},

		renderMenu:function(){

			return this.state.items.map(function(item){
				return (<MenuItem key={item.id} text={item.text} id={item.id} data-callback={this.handleItemSelected}/>);
			}.bind(this));
		},
		componentWillMount:function(){
			this.__cid = ++__key;
		},
		handleItemSelected:function(id){

			var cid = id,
				__index = -1;
				// console.log(this);
				if(Array.prototype.findIndex){
					__index =  this.state.items.findIndex(function(item){
						return (item.id + "") === cid;
					});

				}else{
					this.state.items.forEach(function(item, idx){
						if( (item.id + "") === cid){
							__index = idx;
						}
					});
				}

				this.setState({currentIdx: __index});

		},

		closeMenu:function(e){
			if(e.target){
				if(+(e.target.parentElement.getAttribute("data-cid")) === this.getCID()){
					return ;
				}
			}

			if(this.state.isShow){
				this.setState({isShow: false});
			}

		},

		componentDidMount:function(){

			if(document.addEventListener){
				document.addEventListener("click", this.closeMenu);
			}else{
				document.attachEvent("click", this.closeMenu);
			}

			this.setState({
				items:[
					{
						"id":"1",
						"text":"test1"
					},
					{	
						"id":"2",
						"text":"test2"
					},
					{	
						"id":"3",
						"text":"test3"
					},
				],
				currentIdx: -1,
				isShow: false});

		},

		componentWillUnmount:function(){

			if(document.removeEventListener){
				document.removeEventListener("click", this.closeMenu);
			}else{
				document.detachEvent("click", this.closeMenu);
			}

		},

		handleToggle:function(e){

			this.setState({isShow: !this.state.isShow});
			// this.refs["itemContainer"].

		},
		getCID:function(){
			return this.__cid;
		},
		render:function(){

			var menuClassName = "drop-container ";
			menuClassName += this.state.isShow?"drop-menu-show":"drop-menu-hide";


			if(this.state.currentIdx >= 0){
				console.log(this.state.items[this.state.currentIdx].text);
			}

			return (
				<div className = {menuClassName} data-cid={this.getCID()}>
				<input className="drop-input" cid={this.state.currentIdx} value={this.state.currentIdx-0>=0?this.state.items[this.state.currentIdx].text:""}/>
				<span className = "drop-indicator" onClick={this.handleToggle}/>

				<ul className="drop-menu" ref="itemContainer">
				{this.renderMenu()}
				</ul>

				</div>

			);
		}
	});

	var MenuItem = React.createClass({

		getInitialState:function(){
			return {itemStyle: ["drop-item"]};
		},
		enterItem:function(e){
			var aStyles = this.state.itemStyle;

			if(!aStyles.some(function(item){ return item === "drop-item-hover";})){
				this.state.itemStyle.push("drop-item-hover");
				this.setState({itemStyle: this.state.itemStyle});
			}

		},
		leaveItem:function(e){
			var aStyles = this.state.itemStyle;
			if(aStyles.some(function(item){ return item === "drop-item-hover";})){
				aStyles.pop();
				this.setState({itemStyle: aStyles});
			}
		},

		handleClicked:function(e){
			this.props['data-callback'].apply(this,[this.props.id]);
		},

		render:function(){

			return (<li className={this.state.itemStyle.join(" ")} onClick={this.handleClicked} onMouseEnter={this.enterItem} onMouseLeave={this.leaveItem}>{this.props.text}</li>);
		}
	});

	return typeof module !== 'undefined'?(module.exports = DropDown):(exports.DropDown=DropDown);

}))

