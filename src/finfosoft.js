//Finfosoft前端框架 js库 
var Finfosoft = {
	
	/*
	@ 插件名： 环形滚动条插件
	@ 插件作者：dongmo / Michael.Lu
	@ 插件版本：1.0
	@ 插件兼容性：IE9.0及以上浏览器
	@ API
	 * el: 元素选择器
	 * startDeg：起始角度(0度->x轴正向)
	 * endDeg：结束角度(0度->x轴正向)
	 ** lineWidth：滚动条宽度
	 ** bgColor: 滚动条背景色
	 ** mainColor： 主情景色
	 ** initVal：input接口
	@ 插件实例：
		new Finfosoft.Ring({
			el: '.finfosoft-ring',
			startDeg: 150,
			endDeg: 30,
			lineWidth: 18,
			bgColor: '#eeeeee',
			mainColor: '#66ee66',
			initVal: 20
		});
	*/
	Ring: function(opts) {
		this.parent = document.querySelector(opts.el);
		this.canvas = this.parent.querySelector('canvas');
		this.gc = this.canvas.getContext('2d');
		this.input = this.parent.querySelector('input');
		this.width = this.height = this.parent.clientWidth;
		this.startDeg = opts.startDeg;
		this.endDeg = opts.endDeg;
		this.lineWidth = opts.lineWidth ? opts.lineWidth : 0.2*this.width;
		this.bgColor = opts.bgColor ? opts.bgColor : '#eeeeee';
		this.mainColor = opts.mainColor ? opts.mainColor : '#66ee66';
		this.initVal = opts.initVal ? opts.initVal : (this.input.value ? this.input.value : 0);
		this.radius = (this.width-this.lineWidth)/2;
		this.init();
	},
	
	OnOff: function(opts) {
		this.parent = document.querySelector(opts.el);
		this.leftBtn = this.parent.querySelector('.left');
		this.rightBtn = this.parent.querySelector('.right');
		this.slideBar = this.parent.querySelector('.slideBar');
		this.slider = this.parent.querySelector('.slider');
		this.width = this.parent.clientWidth;
		this.height = this.parent.clientHeight;
		this.status = opts.status;
		this.oldStatus = opts.status;
		this.onChanged = opts.onChanged;
		this.init();
	}
	
}

//工具库
Finfosoft.prototype = {
	
	//构造函数指针修正
	constructor: this
	
}

//Ring插件方法
Finfosoft.Ring.prototype = {
	
	//构造函数指针修正
	constructor: this,
	
	//插件初始化
	init(ev) {
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.canvas.onmousedown = ev => {
			var ev = ev || window.event;
			this.mousedown(ev);
		};
		this.drawLine(this.endDeg+360,this.bgColor);
		this.drawLine(this.startDeg,this.mainColor);
		this.input.onfocus = this.focus;
		this.input.onblur = () => {
			this.blur();
		};
		this.input.onkeyup = ev => {
			var ev = ev || window.event;
			this.keyup(ev);
		}
		this.initValue(this.initVal);
		this.reDraw(this.startDeg+this.input.value*(this.endDeg+360-this.startDeg)/100);
	},
	
	//input初始化
	initValue(val) {
		if (val<0) {
			this.input.value = 0;
		} else if (val>100) {
			this.input.value = 100;
		} else {
			this.input.value = parseInt(val);
		}
		this.input.style.width = 0.3*this.width + 'px';
		this.input.style.fontSize = 0.16*this.width + 'px';
		this.input.style.lineHeight = 0.16*this.width + 'px';
		this.input.style.color = this.mainColor;
		this.input.style.left = (this.width-this.input.clientWidth)/2 + 'px';
		this.input.style.top = (this.height-this.input.clientHeight)/2 + 'px';
	},
	
	//基础线条绘制
	drawLine(endDeg,color) {
		this.gc.beginPath();
		this.gc.arc(this.width/2,this.height/2,this.radius,this.startDeg*Math.PI/180,endDeg*Math.PI/180,false);
		this.gc.lineWidth = this.lineWidth;
		this.gc.strokeStyle = color;
		this.gc.stroke();
	},
	
	//重绘
	reDraw(iDeg) {
		this.gc.clearRect(0,0,this.width,this.height);
		this.drawLine(this.endDeg+360,this.bgColor);
		this.drawLine(iDeg,this.mainColor);
	},
	
	//获取到document的距离
	getPosToDoc(obj) {
		var dis = {
			left: 0,
			top: 0
		};
		while (obj) {
			dis.left += obj.offsetLeft;
			dis.top += obj.offsetTop;
			obj = obj.offsetParent;
		}
		return dis;
	},
	
	//鼠标交互逻辑
	mouseCtrl(x,y) {
		if (y<=this.height/2) {
			var iDeg = 270 + Math.atan((x-this.width/2)/(this.height/2-y))*180/Math.PI;
		} else {
			var iDeg = 90 + Math.atan((x-this.width/2)/(this.height/2-y))*180/Math.PI;
		}
		if (iDeg>this.endDeg&&iDeg<this.startDeg) {
			if (x<=this.width/2) {
				iDeg = this.startDeg;
			} else {
				iDeg = this.endDeg;
			}
		}
		if (iDeg>=this.startDeg) {
			var iScale = (iDeg-this.startDeg)/(this.endDeg+360-this.startDeg);
		} else if (iDeg<=this.endDeg) {
			var iScale = (360+iDeg-this.startDeg)/(this.endDeg+360-this.startDeg);
		}
		this.reDraw(iDeg);
		this.rangeText(iScale);
	},
	
	//鼠标按下时进度条响应
	mousedown(ev) {
		var x = ev.clientX - this.getPosToDoc(this.canvas).left;
		var y = ev.clientY - this.getPosToDoc(this.canvas).top;
		this.mouseCtrl(x,y);
		document.onmousemove = ev => {
			var ev = ev || window.event;
			this.mousemove(ev);
		};
		document.onmouseup = () => {
			document.onmousemove = document.monmouseup = null;
		};
	},
	
	//鼠标移动时进度条响应
	mousemove(ev) {
		var x = ev.clientX - this.getPosToDoc(this.canvas).left;
		var y = ev.clientY - this.getPosToDoc(this.canvas).top;
		this.mouseCtrl(x,y);
	},
	
	//数值按比例响应
	rangeText(scale) {
		this.input.value = Math.round(scale*100);
	},
	
	//输入框获取焦点
	focus() {
		this.origVal = this.value;
		this.value = '';
	},
	
	//输入框失去焦点时进度条响应
	blur() {
		if (!this.input.value) {
			this.input.value = this.input.origVal;
			return;
		}
		var iDeg = this.startDeg + this.input.value*(this.endDeg+360-this.startDeg)/100;
		this.reDraw(iDeg);
	},
	
	//回车确定
	keyup(ev) {
		this.regularVal();
		if (ev.keyCode===13) {
			this.input.blur();
		}
	},
	
	//禁用除数字外的其他输入
	regularVal() {
		this.input.value = this.input.value.replace(/\D/g,'');
		if (this.input.value.length>2) {
			this.input.value = 100;
		}
	},
	
	reset() {
		var iDeg = this.startDeg + this.initVal*(this.endDeg+360-this.startDeg)/100;
		var iScale = (iDeg-this.startDeg)/(this.endDeg+360-this.startDeg);
		this.rangeText(iScale);
		this.reDraw(iDeg);
	}
	
};

//Ring插件方法
Finfosoft.OnOff.prototype = {
	
	//构造函数指针修正
	constructor: this,
	
	//插件初始化
	init() {
		this.setStyle();
		this.dragSlider();
		this.judgeStatus(this.status);
	},
	
	//初始化组件大小
	setStyle() {
		this.leftBtn.style.lineHeight = this.rightBtn.style.lineHeight = this.height + 'px';
		this.slideBar.style.width = this.width / 4 + 'px';
		this.slideBar.style.height = this.height / 3 + 'px';
		this.slideBar.style.left = (this.width - this.width / 4) / 2 + 'px';
		this.slideBar.style.top = this.height / 3 + 'px';
		this.slideBar.style.borderRadius = this.height / 3 / 2 + 'px';
		this.slider.style.width = this.slider.style.height = this.height + 'px';
		this.slider.style.left = (this.width - this.width / 4) / 2 + (this.width / 4) / 2 + 'px';
		this.slider.style.top = 0;
		this.slider.startPos = (this.width - this.width / 4) / 2 - this.height/2;
		this.slider.endPos = (this.width - this.width / 4) / 2 - this.height/2 + this.width / 4;
	},
	
	//状态判断
	judgeStatus() {
		switch (this.status) {
			case 1:
				this.slider.style.left = this.slider.startPos + 'px';
				this.leftBtn.style.color = '#1ab394';
				this.rightBtn.style.color = '#aeaeae';
				break;
			case 0:
				this.slider.style.left = this.slider.endPos + 'px';
				this.leftBtn.style.color = '#aeaeae';
				this.rightBtn.style.color = '#1ab394';
				break;
		}
	},
	
	//拖拽
	dragSlider() {
		this.parent.onmousedown = ev => {
			var ev = ev || window.event;
			var startX = ev.clientX - this.getPosToDoc(this.parent).left;
			var disX = ev.clientX;
			var isMoved = false;
			document.onmousemove = ev => {
				var ev = ev || window.event;
				var curX = ev.clientX - disX + startX;
				if (curX>this.width/2) {
					this.status = 0;
				} else {
					this.status = 1;
				}
				this.judgeStatus();
				isMoved = true;
				return false;
			};
			document.onmouseup = () => {
				document.onmousemove = document.onmouseup = null;
				if (!isMoved) {
					if (startX>this.width/2) {
						this.status = 0;
					} else {
						this.status = 1;
					}
					this.judgeStatus();
				}
				if (this.oldStatus!=this.status) {
					this.onChanged && this.onChanged(this.status);
				}
			};
		};
	},
	
	//回到原位置
	reset() {
		this.status = this.oldStatus;
		this.judgeStatus();
	},
	
	//获取到document的距离
	getPosToDoc(obj) {
		var dis = {
			left: 0,
			top: 0
		};
		while (obj) {
			dis.left += obj.offsetLeft;
			dis.top += obj.offsetTop;
			obj = obj.offsetParent;
		}
		return dis;
	}

};