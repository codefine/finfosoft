//Finfosoft前端框架 js库 
const Finfosoft = {

	// _: function() {},

	Ring: function (opts) {
		this.buildBasicEnvironment(opts.el);
		this.width = this.height = this.parent.clientWidth;
		this.startDeg = opts.startDeg;
		this.endDeg = opts.endDeg;
		this.lineWidth = opts.lineWidth ? opts.lineWidth : 0.2 * this.width;
		this.bgColor = opts.bgColor ? opts.bgColor : '#eeeeee';
		this.mainColor = opts.mainColor ? opts.mainColor : '#66ee66';
		this.initVal = opts.initVal ? opts.initVal : (this.input.value ? this.input.value : 0);
		this.radius = (this.width - this.lineWidth) / 2;
		this.init();
	},

	OnOff: function (opts) {
		this.buildBasicEnvironment(opts.el);
		this.timer = null;
		this.leftBtn.innerHTML = opts.ui ? opts.ui[0] : "LEFT";
		this.rightBtn.innerHTML = opts.ui ? opts.ui[1] : "RIGHT";
		this.mainColor = opts.mainColor ? opts.mainColor : "#1ab394";
		this.sliderColor = opts.sliderColor ? opts.sliderColor : this.mainColor;
		this.width = this.parent.clientWidth;
		this.height = this.parent.clientHeight;
		this.status = typeof opts.status === "undefined" ? 0 : opts.status;
		this.oldStatus = opts.status;
		this.onChanged = opts.onChanged;
		this.init();
	},
	
	Loading: function (opts) {
		this.opacity = opts.shade ? opts.shade[0]: '0.7';
		this.bgColor = opts.shade ? opts.shade[1]: '#ffffff';
		this.fontColor = opts.color ? opts.color : '#000000';
		this.message = opts.msg ? opts.msg : "loading...";
		this.time = opts.time ? opts.time : 0;
		this.init();
	}

}

//工具库
Finfosoft.prototype = {

	//构造函数指针修正
	constructor: this

};

//Ring插件方法
Finfosoft.Ring.prototype = {

	//构造函数指针修正
	constructor: this,

	//插件初始化
	init(ev) {
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.parent.onmousedown = ev => {
			ev = ev || window.event;
			this.mousedown(ev);
		};
		this.drawLine(this.endDeg + 360, this.bgColor);
		this.drawLine(this.startDeg, this.mainColor);
		this.input.onfocus = this.focus;
		this.input.onblur = () => {
			this.blur();
		};
		this.input.onkeyup = ev => {
			ev = ev || window.event;
			this.keyup(ev);
		}
		this.initValue(this.initVal);
		this.reDraw(this.startDeg + this.input.value * (this.endDeg + 360 - this.startDeg) / 100);
	},

	//创建基本dom环境
	buildBasicEnvironment(parentDom) {
		const parent = document.querySelector(parentDom);
		parent.classList.add("finfosoft-ring");
		this.parent = parent;

		const canvas = document.createElement('canvas');
		const gc = canvas.getContext('2d');
		[this.canvas, this.gc] = [canvas, gc];
		this.parent.appendChild(this.canvas);

		const input = document.createElement('input');
		input.setAttribute("type", "text");
		this.input = input;
		this.parent.appendChild(this.input);
	},

	//input初始化
	initValue(val) {
		if (val < 0) {
			this.input.value = 0;
		} else if (val > 100) {
			this.input.value = 100;
		} else {
			this.input.value = parseInt(val);
		}
		this.input.style.width = 0.3 * this.width + 'px';
		this.input.style.fontSize = 0.16 * this.width + 'px';
		this.input.style.lineHeight = 0.16 * this.width + 'px';
		this.input.style.color = this.mainColor;
		this.input.style.left = (this.width - this.input.clientWidth) / 2 + 'px';
		this.input.style.top = (this.height - this.input.clientHeight) / 2 + 'px';
	},

	//基础线条绘制
	drawLine(endDeg, color) {
		this.gc.beginPath();
		this.gc.arc(this.width / 2, this.height / 2, this.radius, this.startDeg * Math.PI / 180, endDeg * Math.PI / 180, false);
		this.gc.lineWidth = this.lineWidth;
		this.gc.strokeStyle = color;
		this.gc.stroke();
	},

	//重绘
	reDraw(iDeg) {
		this.gc.clearRect(0, 0, this.width, this.height);
		this.drawLine(this.endDeg + 360, this.bgColor);
		this.drawLine(iDeg, this.mainColor);
	},

	//鼠标交互逻辑
	mouseCtrl(x, y) {
		let [iDeg, iScale] = [0, 0];
		if (y <= this.height / 2) {
			iDeg = 270 + Math.atan((x - this.width / 2) / (this.height / 2 - y)) * 180 / Math.PI;
		} else {
			iDeg = 90 + Math.atan((x - this.width / 2) / (this.height / 2 - y)) * 180 / Math.PI;
		}
		if (iDeg > this.endDeg && iDeg < this.startDeg) {
			if (x <= this.width / 2) {
				iDeg = this.startDeg;
			} else {
				iDeg = this.endDeg;
			}
		}
		if (iDeg >= this.startDeg) {
			iScale = (iDeg - this.startDeg) / (this.endDeg + 360 - this.startDeg);
		} else if (iDeg <= this.endDeg) {
			iScale = (360 + iDeg - this.startDeg) / (this.endDeg + 360 - this.startDeg);
		}
		this.reDraw(iDeg);
		this.rangeText(iScale);
	},

	//鼠标按下时进度条响应
	mousedown(ev) {
		const x = ev.clientX - _.getPosToDoc(this.canvas).left + _.getScrollDis().x;
		const y = ev.clientY - _.getPosToDoc(this.canvas).top + _.getScrollDis().y;
		this.mouseCtrl(x, y);
		document.onmousemove = ev => {
			ev = ev || window.event;
			this.mousemove(ev);
		};
		document.onmouseup = () => {
			document.onmousemove = document.monmouseup = null;
		};
	},

	//鼠标移动时进度条响应
	mousemove(ev) {
		const x = ev.clientX - _.getPosToDoc(this.canvas).left + _.getScrollDis().x;
		const y = ev.clientY - _.getPosToDoc(this.canvas).top + _.getScrollDis().y;
		this.mouseCtrl(x, y);
	},

	//数值按比例响应
	rangeText(scale) {
		this.input.value = Math.round(scale * 100);
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
		const iDeg = this.startDeg + this.input.value * (this.endDeg + 360 - this.startDeg) / 100;
		this.reDraw(iDeg);
	},

	//回车确定
	keyup(ev) {
		this.regularVal();
		if (ev.keyCode === 13) {
			this.input.blur();
		}
	},

	//禁用除数字外的其他输入
	regularVal() {
		this.input.value = this.input.value.replace(/\D/g, '');
		if (this.input.value.length > 2) {
			this.input.value = 100;
		}
	},

	reset() {
		const iDeg = this.startDeg + this.initVal * (this.endDeg + 360 - this.startDeg) / 100;
		const iScale = (iDeg - this.startDeg) / (this.endDeg + 360 - this.startDeg);
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

	//创建基本dom环境
	buildBasicEnvironment(parentDom) {

		// this.buildBasicEnvironment(parentDom);
		const parent = document.querySelector(parentDom);
		parent.classList.add('finfosoft-onOff');
		this.parent = parent;

		const leftBtn = document.createElement('span');
		leftBtn.classList.add('left');
		this.leftBtn = leftBtn;
		this.parent.appendChild(this.leftBtn);

		const rightBtn = document.createElement('span');
		rightBtn.classList.add('right');
		this.rightBtn = rightBtn;
		this.parent.appendChild(this.rightBtn);

		const slideBar = document.createElement('p');
		slideBar.classList.add('slideBar');
		this.slideBar = slideBar;
		this.parent.appendChild(this.slideBar);

		const slider = document.createElement('strong');
		slider.classList.add('slider');
		this.slider = slider;
		this.parent.appendChild(this.slider);
	},

	//初始化组件大小
	setStyle() {
		this.leftBtn.style.lineHeight = this.rightBtn.style.lineHeight = this.height + 'px';
		
		this.slideBar.style.width = this.width - this.leftBtn.clientWidth - this.rightBtn.clientWidth + 'px';
		this.slideBar.style.height = this.height / 5 + 'px';
		this.slideBar.style.left = (this.leftBtn.clientWidth + this.rightBtn.clientWidth) / 2 + 'px';
		this.slideBar.style.top = (this.height - this.slideBar.clientHeight) / 2 + 'px';
		this.slideBar.style.borderRadius = this.slideBar.clientHeight / 2 + 'px';
		this.slideBar.style.backgroundColor = this.mainColor;

		this.slider.style.width = this.slider.style.height = this.slideBar.clientHeight * 3 + 'px';
		this.slider.style.top = (this.height - this.slideBar.clientHeight) / 2 - (this.slider.clientHeight - this.slideBar.clientHeight) / 2 + 'px';
		this.slider.style.backgroundColor = this.sliderColor;
		
		this.slider.startPos = (this.width - this.slideBar.clientWidth) / 2 - this.slider.clientWidth / 2;
		this.slider.endPos = this.width - (this.width - this.slideBar.clientWidth) / 2 - this.slider.clientWidth / 2;
	},

	//状态判断
	judgeStatus() {
		switch (this.status) {
			case 1:
				this.slider.style.left = this.slider.endPos + 'px';
				this.leftBtn.style.color = '#aeaeae';
				this.rightBtn.style.color = this.mainColor;
				break;
			case 0:
				this.slider.style.left = this.slider.startPos + 'px';
				this.leftBtn.style.color = this.mainColor;
				this.rightBtn.style.color = '#aeaeae';
				break;
		}
	},

	//拖拽
	dragSlider() {
		this.parent.onmousedown = ev => {
			clearTimeout(this.timer);
			ev = ev || window.event;
			const startX = ev.clientX - _.getPosToDoc(this.parent).left + _.getScrollDis().x;
			const disX = ev.clientX;
			let isMoved = false;
			document.onmousemove = ev => {
				ev = ev || window.event;
				const curX = ev.clientX - disX + startX;
				if (curX > this.width / 2) {
					this.status = 1;
				} else {
					this.status = 0;
				}
				this.judgeStatus();
				isMoved = true;
				return false;
			};
			document.onmouseup = () => {
				document.onmousemove = document.onmouseup = null;
				if (!isMoved) {
					if (startX > this.width / 2) {
						this.status = 1;
					} else {
						this.status = 0;
					}
					this.judgeStatus();
				}
				if (this.oldStatus != this.status) {
					this.timer = setTimeout(()=>{
						this.onChanged && this.onChanged(this.status);
						this.oldStatus = this.status;
					}, 500);
				}
			};
		};
	},

	//回到原位置
	reset() {
		this.status = this.oldStatus;
		this.judgeStatus();
	}

};

Finfosoft.Loading.prototype = {
    //构造函数指针修正
    constructor: this,

	init() {
    	this.buildBasicEnvironment();
    	this.setStyle();
    	this.showLoading()
	},

	setStyle() {
		this.parent.style.cssText='background:'+this.bgColor+',opacity:'+this.opacity;
		this.parent.lastElementChild.style.color = this.fontColor;
		this.bodyDom.style.cssText = 'overflow: hidden;height: 100%;';
	},

    buildBasicEnvironment() {
		const bodyDom = document.getElementsByTagName('body')[0];
		const parent = document.createElement('div');
        parent.classList.add('finfosft-loading');

        const loadBox = document.createElement('div');
        loadBox.classList.add('loading');
        parent.appendChild(loadBox);

		for(let i = 0; i < 5; i++){
            const loadingSpan = document.createElement('span');
            loadBox.appendChild(loadingSpan);
		}

		const msgBox = document.createElement('div');
        msgBox.innerText = this.message;
        msgBox.classList.add('msgBox');
        parent.appendChild(msgBox);

        bodyDom.appendChild(parent);
        this.parent = parent;
        this.bodyDom = bodyDom;
	},
	showLoading(){
		this.parent.style.display = 'block';
		if(this.time !=0){
		   setTimeout('loading.closeLoading()',this.time);
		}
	},
	closeLoading(){
        this.bodyDom.style.overflow = '';
        this.parent.style.display = 'none';
	}
}

const _ = {

	//获取到document的距离
	getPosToDoc(obj) {
		let [left, top] = [0, 0];
		while (obj) {
			left += obj.offsetLeft;
			top += obj.offsetTop;
			obj = obj.offsetParent;
		}
		return {left, top};
	},

	//获取文档滚动距离
	getScrollDis() {
		let [x, y] = [0, 0];
		if (self.pageYOffset) {
			y = self.pageYOffset;
			x = self.pageXOffset;
		} else if (document.documentElement && document.documentElement.scrollTop) { // Explorer 6 Strict
			y = document.documentElement.scrollTop;
			x = document.documentElement.scrollLeft;
		} else if (document.body) {// all other Explorers
			y = document.body.scrollTop;
			x = document.body.scrollLeft;
		}
		return {x, y};
	}

}