//Finfosoft前端框架 js库 
const Finfosoft = {

	// _: function() {},

	Ring: function (opts) {
		this.buildBasicEnvironment(opts.el);
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

	Clock: function (opts) {
		this.opts = opts;
		this.buildBasicEnvironment(opts.el);
		this.mainColor = opts.mainColor;
		this.timeData = opts.initVal;
		this.time.innerHTML = this.timeArrayToString(this.timeData);
		this.init( this.timeArrayToRange(this.timeData) );
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
		this.width = this.parent.clientWidth;
		this.height = this.parent.clientHeight;

		const canvas = document.createElement('canvas');
		const gc = canvas.getContext('2d');
		[this.canvas, this.gc] = [canvas, gc];
		this.parent.appendChild(this.canvas);
		this.canvas.width = this.width;
		this.canvas.height = this.height;

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

	//初始化组件样式
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
					this.timer = setTimeout(() => {
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

//Clock插件方法
Finfosoft.Clock.prototype = {

	//构造函数指针修正
	constructor: this,

	//插件初始化
	init(range) {
		this.setStyle();
		this.reDraw(range);
		this.setElement();
	},

	//创建基本dom环境
	buildBasicEnvironment(parentDom) {
		const parent = document.querySelector(parentDom);
		parent.classList.add("finfosoft-clock");
		this.parent = parent;
		this.width = this.parent.clientWidth;
		this.height = this.parent.clientHeight;

		const canvas = document.createElement('canvas');
		const gc = canvas.getContext('2d');
		[this.canvas, this.gc] = [canvas, gc];
		this.parent.appendChild(this.canvas);
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		const name = document.createElement('p');
		name.innerHTML = "time";
		name.classList.add('name');
		this.name = name;
		this.parent.appendChild(this.name);

		if (this.opts.initUnit) {
			const unit = document.createElement('input');
			unit.setAttribute("type", "text");
			unit.classList.add('unit');
			unit.value = this.opts.initUnit;
			this.unit = unit;
			this.parent.appendChild(this.unit);
		}

		const time = document.createElement('p');
		time.classList.add('time');
		this.time = time;
		this.parent.appendChild(this.time);

		const panel = document.createElement('dl');
		panel.classList.add('panel');

		const start = document.createElement('dd');
		start.classList.add('start');
		const titleS = document.createElement('p');
		titleS.innerHTML = "开始";
		start.appendChild(titleS);
		panel.appendChild(start);
		const boxS = document.createElement('div');
		boxS.classList.add('box');
		const hourS = _.createSelect(24, this.opts.initVal[0][0]);
		hourS.classList.add('hour', 'ib');
		boxS.appendChild(hourS);
		const minuteS = _.createSelect(60, this.opts.initVal[0][1]);
		minuteS.classList.add('minute', 'ib');
		boxS.appendChild(minuteS);
		start.appendChild(boxS);

		const end = document.createElement('dd');
		end.classList.add('end');
		const titleE = document.createElement('p');
		titleE.innerHTML = "结束";
		end.appendChild(titleE);
		panel.appendChild(end);
		const boxE = document.createElement('div');
		boxE.classList.add('box');
		const hourE = _.createSelect(24, this.opts.initVal[1][0]);
		hourE.classList.add('hour', 'ib');
		boxE.appendChild(hourE);
		const minuteE = _.createSelect(60, this.opts.initVal[1][1]);
		minuteE.classList.add('minute', 'ib');
		boxE.appendChild(minuteE);
		end.appendChild(boxE);

		const btnBox = document.createElement('dt');
		const yesBtn = document.createElement('span');
		yesBtn.classList.add('yes');
		yesBtn.innerHTML = "确定";
		btnBox.appendChild(yesBtn);
		const noBtn = document.createElement('span');
		noBtn.classList.add('no');
		noBtn.innerHTML = "取消";
		btnBox.appendChild(noBtn);
		panel.appendChild(btnBox);
		
		this.hourS = hourS;
		this.minuteS = minuteS;
		this.hourE = hourE;
		this.minuteE = minuteE;
		this.yesBtn = yesBtn;
		this.noBtn = noBtn;
		this.panel = panel;
		this.parent.appendChild(this.panel);

	},

	//初始化组件样式
	setStyle() {
		if (this.opts.initUnit) {
			this.unit.style.color = this.mainColor;
		}
	},

	setElement() {
		this.time.onclick = this.panelCtrl().show;
		this.yesBtn.onclick = () => {
			const newTimeArray = this.timeOptionToArray();
			this.time.innerHTML = this.timeArrayToString(newTimeArray);
			this.reDraw( this.timeArrayToRange(newTimeArray) );
			this.panelCtrl().hide();
			this.timeData = newTimeArray;
			this.opts.onTimeChanged && this.opts.onTimeChanged(this.timeData);
		}
		this.noBtn.onclick = this.panelCtrl().hide;
		this.unit.onblur = () => {
			this.opts.onUnitChanged && this.opts.onUnitChanged(this.unit.value);
		};
		this.unit.onkeyup = (ev) => {
			ev = ev || window.event;
			(ev.keyCode === 13) && this.unit.blur();
		};
	},

	//基础背景绘制
	reDraw(range) {
		const half = (this.width + this.height) / 4;
		const [max, min, clearR, circleR, fontR] = [half, half * 0.94, half * 0.84, half * 0.78, half * 0.68];
		this.clearCanvas();
		this.drawLine(max, 0, "black", 2);
		this.drawLine(max, 90, "black", 2);
		this.drawLine(min, 30, "black", 1);
		this.drawLine(min, 60, "black", 1);
		this.drawLine(min, 120, "black", 1);
		this.drawLine(min, 150, "black", 1);
		this.clearArc(clearR);
		this.drawPoint(circleR, 0, 360, "gray", 1);
		this.drawFont(fontR);
		if (range) {
			(range[0] !== range[1]) && this.drawPoint(circleR, range[0], range[1], this.mainColor, 2);
			(range[0] === range[1]) && this.drawPoint(circleR, 0, 360, this.mainColor, 2);
		}
	},

	clearCanvas() {
		this.gc.clearRect(0, 0, this.width, this.height);
	},

	//圆形清除
	clearArc(r) {
		const [cx, cy] = [this.width/2, this.height/2];
		this.gc.beginPath();
		this.gc.moveTo(cx, cy);
		this.gc.arc(cx, cy, r, 0, Math.PI * 2, false);
		this.gc.fillStyle = 'white';
		this.gc.fill();
	},

	//基础线条绘制
	drawLine(len, deg, color, width) {
		const [cx, cy] = [this.width/2, this.height/2];
		this.gc.beginPath();
		this.gc.strokeStyle = color;
		this.gc.lineWidth = width;
		this.gc.moveTo(cx + len * Math.cos( deg * Math.PI / 180 ), cy + len * Math.sin( deg * Math.PI / 180 ));
		this.gc.lineTo(cx - len * Math.cos( deg * Math.PI / 180 ), cy - len * Math.sin( deg * Math.PI / 180 ));
		this.gc.stroke();
	},

	//基础线条绘制
	drawPoint(len, beginDeg, endDeg, color, r) {
		const [cx, cy] = [this.width/2, this.height/2];
		const s = 5; //两点间的角度
		beginDeg = Math.round(beginDeg / s) * s; //规范起始点角度
		const n = endDeg >= beginDeg ? Math.round( (endDeg - beginDeg) / 5 ) : Math.round( (endDeg - beginDeg + 360) / 5 ); //点数
		for (let i = 0; i <= n; i ++) {
			let deg = (beginDeg + s * i - 90) * Math.PI / 180;
			let [px, py] = [cx + len * Math.cos( deg ), cy + len * Math.sin( deg )];
			this.gc.beginPath();
			this.gc.arc(px, py, r, 0, Math.PI * 2, false);
			this.gc.fillStyle = color;
			this.gc.fill();
		}
	},

	drawFont(r) {
		const s = 12;
		const deg = 360 / 12;
		const [cx, cy] = [this.width/2, this.height/2];
		for (let i = 0; i < s; i ++) {
			let [x, y] = [cx + r * Math.cos( (deg * i - 90 ) * Math.PI / 180 ), cy + r * Math.sin( (deg * i - 90) * Math.PI / 180 )];
			let text = i * 2;
			this.gc.textAlign = "center";
			this.gc.textBaseline = "middle";
			this.gc.font = "14px Arial";
			this.gc.fillStyle = "gray";
			this.gc.fillText(text, x, y);
		}
	},

	panelCtrl() {
		return {
			show: () => {
				this.panel.classList.add('active');
			},
			hide: () => {
				this.panel.classList.remove('active');
			}
		}
	},

	//时间数组格式化为字符串
	timeArrayToString(array) {
		return `${array[0][0]}:${array[0][1]} ~ ${array[1][0]}:${array[1][1]}`;
	},

	//时间数组转化为角度范围
	timeArrayToRange(array) {
		const start = (array[0][0] + array[0][1] / 60) / 24 * 360;
		const end = (array[1][0] + array[1][1] / 60) / 24 * 360;
		return [start, end];
	},

	//时间选择后格式化为数组
	timeOptionToArray() {
		return [
			[parseInt(this.hourS.value), parseInt(this.minuteS.value)],
			[parseInt(this.hourE.value), parseInt(this.minuteE.value)]
		];
	}

};

const _ = {

	//获取到document的距离
	getPosToDoc(obj) {
		let [left, top] = [0, 0];
		while (obj) {
			left += obj.offsetLeft;
			top += obj.offsetTop;
			obj = obj.offsetParent;
		}
		return { left, top };
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
		return { x, y };
	},

	//生成下拉菜单
	createSelect(n, index) {
		const select = document.createElement('select');
		for (let i = 0; i < n; i ++) {
			let option = document.createElement('option');
			option.innerHTML = i;
			option.value = i;
			select.appendChild(option);
		}
		select.value = index;
		return select;
	}

}