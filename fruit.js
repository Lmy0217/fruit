
//var img;
//var img = new Image();
//img.src = "apple.svg";

var tip = [];
var tipindex = 0;


var mybeta = 0;
var myalpha = 0;
var ALLTIME = 600;

var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

var x;//鼠标当前移动到的位置
var y;

var BLOCK_ROWS = 8;// 每行每列8个方块
var BLOCK_COLS = 8;
var BLOCK_TYPE = 7; // 方块的种类，共有7种
var BLOCK_WIDTH = 60; // 每个格子的宽
var BLOCK_HEIGHT = 60; // 每个格子的高
var MOVE_PIXEL = 10;// 每单位时间移动的像素
var DROP_PIXEL = 10;// 每单位时间下落的像素
var MOVE_TIME = 20;// 方块移动的单位时间
var BLAST_TIME = 20;// 方块消除单位时间
var DROP_TIME = 10;// 方块下落单位时间
var TYPE = 0;
var t1 = -1;

var is_move_time = false;// 当前是否有方块正在移动
var is_blast_time = false; // 当前是否有方块正在消除
var is_drop_time = false; // 当前是否有方块正在下落
var is_time = false;
var is_restart = false;
var is_tips = false;
var is_music = true;

var is_press = false; // 判断鼠标是否为按下状态
var is_key_down = false; // 判断键盘按键是否按下状态

var now_rows = -1;//当前点击的坐标
var now_cols = -1;

var focus_rows = -1;// 选中状态的方块坐标
var focus_cols = -1;

var SCORE = 0;// 游戏得分
var ALL_SUM = 0; // 累计消除方块数量
var ONE_SUM = 0; // 单次最多消除方块数量
var ADDITION = 1; // 分数加成权值

var block;//用于保存每个方块的类型
var block_status;//用于保存每个方块的状态

if (localStorage.getItem("count") == null) {
	localStorage.setItem("count", 0);
}

block = new Array();
block_status = new Array();
for(var i = -3; i < BLOCK_ROWS + 3; i++) {
	block[i] = new Array();
	block_status[i] = new Array();
	for(var j = -3; j <= BLOCK_COLS + 3; j++) {
		block[i][j] = -1;
		block_status[i][j] = 0;
	}
}
window.onload = start();

//document.onkeydown = key_down;
//document.onkeyup = key_up;

function start() {
	//alert("start");
	tip = [];
	tipindex = 0;
	SCORE = 0;
	ALL_SUM = 0;
	ONE_SUM = 0;
	ctx.clearRect(0, 0, BLOCK_WIDTH * BLOCK_COLS, BLOCK_HEIGHT * BLOCK_ROWS);
	for(var i = 0; i < BLOCK_ROWS; i++) {
		for(var j = 0; j < BLOCK_COLS; j++) {
			rand = get_rand();
			block[i][j] = rand;
			block_status[i][j] = 0;
			//shape(rand, turn_pixel(j), turn_pixel(i), 0, 1);
		}
	}
	if (check_blast(-1, -1, -1, -1, -1, -1, true)) {
		start();   // 直到开局无法自动消除为止
	} else {
		for(var i = 0; i < BLOCK_ROWS; i++) {
			for(var j = 0; j < BLOCK_COLS; j++) {
				shape(block[i][j], turn_pixel(j), turn_pixel(i), 0, 1);
			}
		}
	}

	if(is_restart) {
		if(t1 != -1) {
			cleartime();
			clearInterval(t1);
			is_time = false;
		}
		is_restart = false;
	}
	if(!is_time && TYPE == 1)
		countDown();
	//document.getElementById("score").innerHTML = SCORE;
	$(".score").html(SCORE);
}


function check_blast(obj_rows, obj_cols, obj_type, orl_rows, orl_cols, orl_type, mode) { // mode如果为true 那么返回可以消除方块的数量，否则直接执行消除，用于初始化地图做判断
	if(is_blast_time) return false;
	var i = 0;
	var j = 0;
	var turn = false;
	var num = 0;
	var array_rows = new Array();//待消除列表
	var array_cols = new Array();

	if (obj_type == -1) { // 参数全为-1则为全图检测
		var vertical_rows = new Array();
		var vertical_cols = new Array();
		var flat_rows = new Array();
		var flat_cols = new Array();

		for (var k = 0; k < BLOCK_ROWS; k++)
			for (var l = 0; l < BLOCK_COLS; l++) {
				type = block[k][l];
				vertical_rows = [];
				vertical_cols = [];
				flat_rows = [];
				flat_cols = [];

				i = 0;
				while(block[k][l + i] == type) {
					flat_rows[i] = k;
					flat_cols[i] = l + i;
					i++;
				}

				i = 0;
				while(block[k + i][l] == type) {
					vertical_rows[i] = k + i;
					vertical_cols[i] = l;
					i++;
				}

				check_special(flat_rows, flat_cols, vertical_rows, vertical_cols);

				if(flat_rows.length >= 3)
					for(var m = 0; m < flat_rows.length; m++) {
						if (flat_rows[m] != -1) {
							array_rows[num] = flat_rows[m];
							array_cols[num] = flat_cols[m];
							num++;
						}
					}

				if(vertical_rows.length >= 3)
					for(var m = 0; m < vertical_rows.length; m++) {
						if (flat_rows[m] != -1) {
							array_rows[num] = vertical_rows[m];
							array_cols[num] = vertical_cols[m];
							num++;
						}
					}
			}
		if (mode) return num;
	} else {
		var orl_vertical_rows = new Array();
		var orl_vertical_cols = new Array();
		var orl_flat_rows = new Array();
		var orl_flat_cols = new Array();
		var obj_vertical_rows = new Array();
		var obj_vertical_cols = new Array();
		var obj_flat_rows = new Array();
		var obj_flat_cols = new Array();

		while(true) {
			if (block[orl_rows][orl_cols + i] == orl_type) {
				orl_flat_rows[j] = orl_rows;
				orl_flat_cols[j] = orl_cols + i;
				j++;
			} else {
				if(turn)
					break;
				turn = true;
				i = 0;
			}
			if(! turn)
				i++;
			else
				i--;
		}


		i = 0;
		j = 0;
		turn = false;
		while(true) { //上下
			if (block[orl_rows + i][orl_cols] == orl_type) {
				orl_vertical_rows[j] = orl_rows + i;
				orl_vertical_cols[j] = orl_cols;
				j++;
			} else {
				if(turn)
					break;
				turn = true;
				i = 0;
			}
			if(! turn)
				i++;
			else
				i--;
		}


		i = 0;
		j = 0;
		turn = false;
		while(true) {
			if (block[obj_rows][obj_cols + i] == obj_type) {
				obj_flat_rows[j] = obj_rows;
				obj_flat_cols[j] = obj_cols + i;
				j++;
			} else {
				if(turn)
					break;
				turn = true;
				i = 0;
			}
			if(! turn)
				i++;
			else
				i--;
		}

		i = 0;
		j = 0;
		turn = false;
		while(true) {
			if (block[obj_rows + i][obj_cols] == obj_type) {
				obj_vertical_rows[j] = obj_rows + i;
				obj_vertical_cols[j] = obj_cols;
				j++;
			} else {
				if(turn)
					break;
				turn = true;
				i = 0;
			}
			if(! turn)
				i++;
			else
				i--;
		}

		// 判断是否可以生成特殊宝石 并且去掉重复的坐标
		check_special(orl_flat_rows, orl_flat_cols, orl_vertical_rows, orl_vertical_cols);
		check_special(obj_flat_rows, obj_flat_cols, obj_vertical_rows, obj_vertical_cols);
		if(orl_flat_rows.length >= 3)
			for(var k = 0; k < orl_flat_rows.length; k++) {
				if (orl_flat_rows[k] != -1) {
					array_rows[num] = orl_flat_rows[k];
					array_cols[num] = orl_flat_cols[k];
					num++;
				}
			}
		if(orl_vertical_rows.length >= 3)
			for(var k = 0; k < orl_vertical_rows.length; k++) {
				if (orl_flat_cols[k] != -1) {
					array_rows[num] = orl_vertical_rows[k];
					array_cols[num] = orl_vertical_cols[k];
					num++;
				}
			}
		if(obj_flat_rows.length >= 3)
			for(var k = 0; k < obj_flat_rows.length; k++) {
				if (obj_flat_rows[k] != -1) {
					array_rows[num] = obj_flat_rows[k];
					array_cols[num] = obj_flat_cols[k];
					num++;
				}
			}
		if(obj_vertical_rows.length >= 3)
			for(var k = 0; k < obj_vertical_rows.length; k++) {
				if (obj_vertical_rows[k] != -1) {
					array_rows[num] = obj_vertical_rows[k];
					array_cols[num] = obj_vertical_cols[k];
					num++;
				}
			}
		if (mode) return num;
	}

	add_score(array_rows.length, 0);

	if (num == 0)
		move(obj_rows, obj_cols,orl_rows, orl_cols, false);
	else { // 消除宝石
		//if(is_music) {
			var hit = document.getElementById("hit");
			hit.load();
			hit.play();
		//}
		
		if(TYPE == 1) {
			if(array_rows.length == 3) addtime(ALLTIME / 30);//2s
			else if(array_rows.length == 4) addtime(ALLTIME / 12);//5s
			else if(array_rows.length >= 5) addtime(ALLTIME / 6);//10s
		}
	
		var time = 1;
		var change = false; // 用于判断放大还是缩小
		timer_blast = setInterval(function() {
			if(time > 0) {
				is_blast_time = true;
				for(var k = 0; k < array_cols.length; k++) {
					ctx.clearRect(turn_pixel(array_cols[k]) - 2, turn_pixel(array_rows[k]) - 2, BLOCK_HEIGHT + 5, BLOCK_WIDTH + 5);  //Clear the canvas
					off = parseInt(BLOCK_WIDTH * 0.5 * (1 - time));
					shape(block[array_rows[k]][array_cols[k]], 1 / time * (turn_pixel(array_cols[k]) + off), 1 / time * (turn_pixel(array_rows[k]) + off), block_status[array_rows[k]][array_cols[k]], time);
				}
				if (! change && (time < 1.15)) {
					time += 0.05;
					if (time >= 1.15) change = true;
				} else
					time -= 0.1;
			} else {
				//再清除一次图形，手机上会有无法消除的问题  依然无法解决
				for(var k = 0; k < array_cols.length; k++) {
					ctx.clearRect(turn_pixel(array_cols[k]) - 2, turn_pixel(array_rows[k]) - 2, BLOCK_HEIGHT + 5, BLOCK_WIDTH + 5);
				}

				is_blast_time = false;
				clearInterval(timer_blast);
				for(var m = 0; m < array_rows.length; m++) {
					block[array_rows[m]][array_cols[m]] = 0;
					set_status(array_rows[m], array_cols[m], 0);
					ctx.clearRect(turn_pixel(array_cols[m]), turn_pixel(array_rows[m]), BLOCK_HEIGHT, BLOCK_WIDTH);
				}
				drop();
			}
		}, BLAST_TIME);
	}
}


function check_special(flat_rows, flat_cols, vertical_rows, vertical_cols) {
	var flat_len = 0;
	var vertical_len = 0;
	// 去掉重复的坐标
	for (var i = 0; i < flat_rows.length; i++)
		for (var j = 0; j < i; j++)
			if ((flat_rows[i] == flat_rows[j]) && (flat_cols[i] == flat_cols[j])) {
				//alert(i+" 333 " +j);
				flat_rows[i] = -1;
				flat_cols[i] = -1;
			}
	for (var i = 0; i < vertical_rows.length; i++)
		for (var j = 0; j < i; j++)
			if ((vertical_rows[i] == vertical_rows[j]) && (vertical_cols[i] == vertical_cols[j])) {
				vertical_rows[i] = -1;
				vertical_cols[i] = -1;
			}
	for (var i = 0; i < flat_rows.length; i++)
		if (flat_rows[i] != -1) flat_len++;

	for (var i = 0; i < vertical_rows.length; i++)
		if (vertical_rows[i] != -1) vertical_len++;

}


function move(obj_rows, obj_cols, orl_rows, orl_cols, check) {
	set_focus("cancel", focus_rows, focus_cols);
	var mode;
	cols = turn_pixel(orl_cols);
	cols2 = turn_pixel(obj_cols);
	rows = turn_pixel(orl_rows);
	rows2 = turn_pixel(obj_rows);
	orl_type = block[orl_rows][orl_cols];
	obj_type = block[obj_rows][obj_cols];
	orl_status = block_status[orl_rows][orl_cols];
	obj_status = block_status[obj_rows][obj_cols];

	if(obj_rows == orl_rows) { // 横向交换
		if(obj_cols > orl_cols) { //向右换
			timer = setInterval(function() {
				if(turn_pixel(obj_cols) >= cols) {
					is_move_time = true;
					ctx.clearRect(turn_pixel(orl_cols), turn_pixel(orl_rows), 2 * BLOCK_HEIGHT,  BLOCK_WIDTH);  //Clear the canvas
					shape(obj_type, cols2, rows2, obj_status, 1);
					shape(orl_type, cols, rows, orl_status, 1);
					cols += MOVE_PIXEL;
					cols2 -= MOVE_PIXEL;
				} else {
					is_move_time = false;
					clearInterval(timer);  //Stop setInterval() when it arrives
					block[orl_rows][orl_cols] = obj_type;
					block[obj_rows][obj_cols] = orl_type;
					set_status(orl_rows, orl_cols, obj_status);
					set_status(obj_rows, obj_cols, orl_status);
					if(check)
						check_blast(orl_rows, orl_cols, block[orl_rows][orl_cols], obj_rows, obj_cols, block[obj_rows][obj_cols], false);
				}
			}, MOVE_TIME);
		} else { //向左换
			timer = setInterval(function() {
				if(turn_pixel(obj_cols) <= cols) {
					is_move_time = true;
					ctx.clearRect(turn_pixel(obj_cols), turn_pixel(obj_rows), 2 * BLOCK_HEIGHT,  BLOCK_WIDTH);  //Clear the canvas
					shape(obj_type, cols2, rows2, obj_status, 1);
					shape(orl_type, cols, rows, orl_status, 1);
					cols -= MOVE_PIXEL;
					cols2 += MOVE_PIXEL;
				} else {
					is_move_time = false;
					clearInterval(timer);  //Stop setInterval() when it arrives
					block[orl_rows][orl_cols] = obj_type;
					block[obj_rows][obj_cols] = orl_type;
					set_status(orl_rows, orl_cols, obj_status);
					set_status(obj_rows, obj_cols, orl_status);
					if(check)
						check_blast(orl_rows, orl_cols, block[orl_rows][orl_cols], obj_rows, obj_cols, block[obj_rows][obj_cols], false);
				}
			}, MOVE_TIME);
		}
	} else if(obj_cols == orl_cols) { // 纵向交换
		if(obj_rows > orl_rows) { //向下换
			timer = setInterval(function() {
				if(turn_pixel(obj_rows) >= rows) {
					is_move_time = true;
					ctx.clearRect(turn_pixel(orl_cols), turn_pixel(orl_rows), BLOCK_HEIGHT, BLOCK_WIDTH * 2);  //Clear the canvas
					shape(obj_type, cols2, rows2, obj_status, 1);
					shape(orl_type, cols, rows, orl_status, 1);
					rows += MOVE_PIXEL;
					rows2 -= MOVE_PIXEL;
				} else {
					is_move_time = false;
					clearInterval(timer);  //Stop setInterval() when it arrives
					block[orl_rows][orl_cols] = obj_type;
					block[obj_rows][obj_cols] = orl_type;
					set_status(orl_rows, orl_cols, obj_status);
					set_status(obj_rows, obj_cols, orl_status);
					if(check)
						check_blast(orl_rows, orl_cols, block[orl_rows][orl_cols], obj_rows, obj_cols, block[obj_rows][obj_cols], false);
				}
			}, MOVE_TIME);
		} else { // 向上换
			timer = setInterval(function() {
				if(turn_pixel(obj_rows) <= rows) {
					is_move_time = true;
					ctx.clearRect(turn_pixel(obj_cols), turn_pixel(obj_rows), BLOCK_HEIGHT, BLOCK_WIDTH * 2);  //Clear the canvas
					shape(obj_type, cols2, rows2, obj_status, 1);
					shape(orl_type, cols, rows, orl_status, 1);
					rows -= MOVE_PIXEL;
					rows2 += MOVE_PIXEL;
				} else {
					is_move_time = false;
					clearInterval(timer);
					block[orl_rows][orl_cols] = obj_type;
					block[obj_rows][obj_cols] = orl_type;
					set_status(orl_rows, orl_cols, obj_status);
					set_status(obj_rows, obj_cols, orl_status);
					if(check)
						check_blast(orl_rows, orl_cols, block[orl_rows][orl_cols], obj_rows, obj_cols, block[obj_rows][obj_cols], false);
				}
			}, MOVE_TIME);
		}
	}
}


function drop() {
	//初始化
	var need = new Array();	// 二维数组，用来表示每个位置需要下降的高度
	var need_max = new Array(); // 需求的最大值 不会递减
	var is_do = new Array();// 在动画中标记已经走到的位置
	var list = new Array();	// 待加入地图的新方块列表
	var list_need = new Array(); // 这个新方块需要下落的高度
	var is_drop_line = new Array(); //一维数组 用来记录当前这列是否是下落状态
	var is_line_draw = new Array(); // 一维数组 用来记录当前这列是否绘制过
	var line_times = new Array();
	var is_drop_block = new Array(); // 二维数组，是否需要下落刷新

	for (var i = -1; i <= BLOCK_ROWS; i++) {
		need[i] = new Array();
		need_max[i] = new Array();
		is_do[i] = new Array();
		list[i] = new Array();
		is_drop_block[i] = new Array();
	}
	for (var i = 0; i < BLOCK_ROWS; i++) {
		for (var j = 0; j < BLOCK_COLS; j++) {
			need[i][j] = 0;
			need_max[i][j] = 0;
			is_do[i][j] = 0;
			list[i][j] = 0;
			is_drop_block[i][j] = true;
		}
		is_drop_line[i] = false;
		is_line_draw[i] = 0;
		line_times[i] = 0;
		list_need[i] = 0;
	}

	//初始化下落方块数据
	var max_drop = 0;
	for (var i = 0; i < BLOCK_ROWS; i++) {
		for (var j = 0; j < BLOCK_COLS; j++) {
			if (block[i][j] == 0) {
				for (var k = 0; k < i; k++) {
					if(block[k][j] != 0) {
						need[k][j] += BLOCK_HEIGHT;
						need_max[k][j] += BLOCK_HEIGHT;
						if(need[k][j] > max_drop) max_drop = need[k][j];
					}
				}
				need[i][j] = -1;
				need_max[i][j] = -1;
				line_times[j]++;
			}
		}
	}
	// var str = '';
	// for(var i = 0; i < BLOCK_ROWS; i++)
	// {
	// str += need_max[i] + "\n";
	// }
	// alert(str);
	//判断是否空位置要比某个下落的位置多，为了解决消除第一行不显示动画的问题
	for (var i = 0; i < BLOCK_COLS ; i++)
		if (turn_pixel(line_times[i]) > max_drop) max_drop = turn_pixel(line_times[i]);

	//按需求生成新方块
	var line_max = new Array();
	var list_max = new Array();
	for (var i = 0; i < BLOCK_ROWS; i++) {
		line_max[i] = 0;
		list_max[i] = 0;
		for (var j = 0; j < BLOCK_COLS; j++) {
			//if(need[j][i] > line_max[i]) line_max[i] = need[j][i];
			if(need[j][i] == -1) {
				line_max[i] += BLOCK_HEIGHT;
				list_max[i] += BLOCK_HEIGHT;
				list_need[i] += BLOCK_HEIGHT;
			}

		}
		if (line_max[i] > 0) is_drop_line[i] = true;
	}
	for (var j = 0 ; j < BLOCK_COLS; j++)
		for (var i = BLOCK_ROWS -1; i >= 0 ; i--)
			if (need_max[i][j] == 0) is_drop_block[i][j] = false;
			else break;
	// var str = '';
	// for(var i = 0; i < BLOCK_ROWS; i++)
	// {
	// str += block_status[i] + "\n";
	// }
	// alert(str);
	//将每列需求的方块个数装入新方块数组中
	for (var i = 0; i < BLOCK_COLS; i++) {
		var j = 0;
		while (line_max[i] > 0) {
			list[i][j] = get_rand();;
			line_max[i] -= BLOCK_WIDTH;
			j++;
		}
	}

	timer_drop = setInterval(function() {
		is_drop_time = true;
		if(max_drop > 0) {
			for (var i = 0; i < BLOCK_ROWS; i++)
				for (var j = 0; j < BLOCK_COLS; j++)
					if(is_drop_block[i][j])
						ctx.clearRect(turn_pixel(j), turn_pixel(i), BLOCK_HEIGHT, BLOCK_WIDTH);

			for (var i = 0; i < BLOCK_ROWS; i++)
				is_line_draw[i] = 0;

			for (var i = 0; i < BLOCK_ROWS; i++)
				for (var j = 0; j < BLOCK_COLS; j++)
					if (is_drop_block[i][j])
						if(need[i][j] > 0) { // 处于下落中的方块
							if (is_do[i][j] < need_max[i][j])
								is_do[i][j] += DROP_PIXEL;
							shape(block[i][j], turn_pixel(j), turn_pixel(i) + is_do[i][j], block_status[i][j], 1);
						} else if (need[i][j] == 0) // 已经停止的方块
							shape(block[i][j], turn_pixel(j), turn_pixel(i),  block_status[i][j], 1);
						else if ((need[i][j] == -1) && (is_line_draw[j] == 0)) { // 对于被消除的方块而言，新生成的方块
							is_line_draw[j] = 1;
							if (is_do[i][j] < list_need[j])
								is_do[i][j] += DROP_PIXEL;
							for (var k = 0; k < turn_coordinate(list_max[j]); k++)
								if (list[j][k] > 0)
									shape(list[j][k], turn_pixel(j),is_do[i][j] - turn_pixel(k +1), 0, 1);
						}
			max_drop -= DROP_PIXEL;
		} else {
			is_drop_time = false;
			clearInterval(timer_drop);
			for (var i = BLOCK_ROWS - 1 ; i >= 0; i--)
				for (var j = BLOCK_COLS -1 ; j >= 0; j--) {
					if (block[i][j] == 0) { // 对消除后的方块的状态进行转移，正确调整至下落后的状态
						var k = 0;
						var sum = 0;
						while(sum == 0) {
							k++;
							if (i - k < 0) { // 如果是第一行的，那么就从list中取新生成的方块
								sum = list[j][0];
								for (var l = 1; l < list[j].length; l++)
									list[j][l - 1] = list[j][l];
							} else // 否则就拿上一行的方块
								sum = block[i - k][j];
						}

						if (i - k < 0) {
							block[i][j] = sum;
							set_status(i, j, 0);
						} else {
							block[i][j] = block[i - k][j];
							set_status(i, j, block_status[i - k][j]);
							block[i - k][j] = 0;
							set_status(i - k, j, 0);
						}
					}
				}
			// var str = '';
			// for(var i = 0; i < BLOCK_ROWS; i++)
			// {
			// str += block_status[i] + "\n";
			// }
			// alert(str);
			check_blast(-1, -1, -1, -1, -1, -1, false);
			check_over();
		}
	}, DROP_TIME);
}


function addtips(x1, y1, x2, y2) {
	var index = (x1 * BLOCK_COLS + y1) * 100 + (x2 * BLOCK_COLS + y2);
	var i;
	for(i = 0; i < tip.length; i++) {
		if(tip[i] == index) break;
	}
	if(i == tip.length) tip[tip.length] = index;
}


function check_over() {
	var sum = 0;
	var this_type = -1; // 当前方块的类型

	tip = [];
	tipindex = 0;
	for (var i = 0; i < BLOCK_ROWS; i++)
		for (var j = 0; j < BLOCK_COLS; j++) {
			//搜索是否存在4种基本的可消牌型
			this_type = block[i][j];
			if (this_type == block[i - 1][j]) {
				sum++;
				if (this_type == block[i + 1][j + 1]) {
					addtips(i + 1, j, i + 1, j + 1);
				} else if (this_type == block[i + 1][j - 1]) {
					addtips(i + 1, j, i + 1, j - 1);
				} else if (this_type == block[i - 2][j - 1]) {
					addtips(i - 2, j, i - 2, j - 1);
				} else if (this_type == block[i - 2][j + 1]) {
					addtips(i - 2, j, i - 2, j + 1);
				} else if (this_type == block[i + 2][j]) {
					addtips(i + 1, j, i + 2, j);
				} else if (this_type == block[i - 3][j]) {
					addtips(i - 2, j, i - 3, j);
				} else if (this_type == block[i - 2][j]) {

				} else {
					sum--;
				}
			}
			if (this_type == block[i][j - 1]) {
				sum++;
				if (this_type == block[i + 1][j + 1]) {
					addtips(i, j + 1, i + 1, j + 1);
				} else if (this_type == block[i - 1][j + 1]) {
					addtips(i, j + 1, i - 1, j + 1);
				} else if (this_type == block[i + 1][j - 2]) {
					addtips(i, j - 2, i + 1, j - 2);
				} else if (this_type == block[i - 1][j - 2]) {
					addtips(i, j - 2, i - 1, j - 2);
				} else if (this_type == block[i][j + 2]) {
					addtips(i, j + 1, i, j + 2);
				} else if (this_type == block[i][j - 3]) {
					addtips(i, j - 2, i, j - 3);
				} else if (this_type == block[i][j - 2]) {

				} else {
					sum--;
				}
			}
			if (this_type == block[i - 2][j]) {
				sum++;
				if (this_type == block[i - 1][j - 1]) {
					addtips(i - 1, j, i - 1, j - 1);
				} else if (this_type == block[i - 1][j + 1]) {
					addtips(i - 1, j, i - 1, j + 1);
				} else {
					sum--;
				}
			}
			if (this_type == block[i][j - 2]) {
				sum++;
				if (this_type == block[i - 1][j - 1]) {
					addtips(i, j - 1, i - 1, j - 1);
				} else if (this_type == block[i + 1][j - 1]) {
					addtips(i, j - 1, i + 1, j - 1);
				} else {
					sum--;
				}
			}
		}
	if (sum == 0) {
		gameover(SCORE, ALL_SUM, ONE_SUM, 0);
	}
}

function get_rand() {
	rand = parseInt(Math.random() * BLOCK_TYPE) + 1;
	while (rand == 8)
		rand = parseInt(Math.random() * BLOCK_TYPE) + 1;
	return rand;
}

function turn_pixel(sum) {
	return sum * BLOCK_WIDTH;
}

function set_status(rows, cols, status) {
	block_status[rows][cols] = status;
}

function add_score(n, status) {
	if (status == 0) {
		//SCORE += (200 * n - 300) * ADDITION;
		if(n == 3) SCORE += 300;
		else if(n == 4) SCORE += 500;
		else SCORE += 200 * n;
	} else if (status == 1) {
		SCORE += (200 * n) * ADDITION;
		BLOCK_FIRE++;
	} else if (status == 2) {
		SCORE += (500 * n) * ADDITION;
		BLOCK_LIGHT++;
	} else if (status == 3) {
		SCORE += (1000 * n) * ADDITION;
		BLOCK_SUPER++;
	}
	if (n > ONE_SUM) ONE_SUM = n;
	ALL_SUM += n;
	//document.getElementById("score").innerHTML = SCORE;
	$(".score").html(SCORE);
}

function shape(type, x, y, status, scale) {
	var color;
	ctx.globalCompositeOperation = "source-over";
	ctx.shadowBlur = 4;
	ctx.shadowColor = "black";
	ctx.shadowOffsetX = 1;
	ctx.shadowOffsetY = 1;
	
	//var shadow_color;
	/* if(type == 5) {
		var img = new Image();
		img.src = "apple.svg";
		img.onload = function(){ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);};
	} */
	//ctx.beginPath();
	if(type == 1) { //紫色的三角形
		/* color = "#E50CE6";
		ctx.moveTo((x + 30) * scale, (y + 5)* scale);
		ctx.lineTo((x + 55) * scale, (y + 55) * scale);
		ctx.lineTo((x + 5) * scale, (y + 55) * scale); */
		var img = new Image();
		img.src = "svg/grape.svg";
		if(img.complete) {
			ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);
		} else {
			img.onload = function() {
				ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);
			};
		}
	} else if(type == 2) { //黄色的四边形 菱形
		/* color = "#F9CC16";
		ctx.moveTo((x + 30) * scale, (y + 5) * scale);
		ctx.lineTo((x + 55) * scale, (y + 30) * scale);
		ctx.lineTo((x + 30) * scale, (y + 55) * scale);
		ctx.lineTo((x + 5) * scale, (y + 30) * scale); */
		var img = new Image();
		img.src = "svg/banana.svg";
		if(img.complete) {
			ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);
		} else {
			img.onload = function() {
				ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);
			};
		}
	} else if(type == 3) { //蓝色的五边形 钻石
		/* color = "#0B73F0";
		ctx.moveTo((x + 20) * scale, (y + 5) * scale);
		ctx.lineTo((x + 40) * scale, (y + 5) * scale);
		ctx.lineTo((x + 55) * scale, (y + 20) * scale);
		ctx.lineTo((x + 30) * scale, (y + 55) * scale);
		ctx.lineTo((x + 5) * scale, (y + 20) * scale); */
		var img = new Image();
		img.src = "svg/pear.svg";
		if(img.complete) {
			ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);
		} else {
			img.onload = function() {
				ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);
			};
		}
	} else if(type == 4) { //橙色的六边形
		/* color = "#F9862F";
		ctx.moveTo((x + 30) * scale, (y + 5) * scale);
		ctx.lineTo((x + 52) * scale, (y + 17) * scale);
		ctx.lineTo((x + 52) * scale, (y + 42) * scale);
		ctx.lineTo((x + 30) * scale, (y + 55) * scale);
		ctx.lineTo((x + 8) * scale, (y + 42) * scale);
		ctx.lineTo((x + 8) * scale, (y + 17) * scale); */
		var img = new Image();
		img.src = "svg/orange.svg";
		if(img.complete) {
			ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);
		} else {
			img.onload = function() {
				ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);
			};
		}
	} else if(type == 5) { //红色的八边形
		/* color = "#EA1530";
		ctx.moveTo((x + 16) * scale, (y + 8) * scale);
		ctx.lineTo((x + 44) * scale, (y + 8) * scale);
		ctx.lineTo((x + 52) * scale, (y + 16) * scale);
		ctx.lineTo((x + 52) * scale, (y + 44) * scale);
		ctx.lineTo((x + 44) * scale, (y + 52) * scale);
		ctx.lineTo((x + 16) * scale, (y + 52) * scale);
		ctx.lineTo((x + 8) * scale, (y + 44) * scale);
		ctx.lineTo((x + 8) * scale, (y + 16) * scale); */
		//img = new Image();
		//img.src = "";
		var img = new Image();
		img.src = "svg/apple.svg";
		if(img.complete) {
			ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);
		} else {
			img.onload = function() {
				ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);
			};
		}
		//img.src = "apple.svg";
		//ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);
		//img.onload = function(){ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);};
		//img.src = "apple.svg";
	} else if(type == 6) { //绿色的十边形
		/* color = "#27C941";
		ctx.moveTo((x + 22) * scale, (y + 8) * scale);
		ctx.lineTo((x + 36) * scale, (y + 8) * scale);
		ctx.lineTo((x + 48) * scale, (y + 12) * scale);
		ctx.lineTo((x + 55) * scale, (y + 30) * scale);
		ctx.lineTo((x + 48) * scale, (y + 48) * scale);
		ctx.lineTo((x + 36) * scale, (y + 52) * scale);
		ctx.lineTo((x + 22) * scale, (y + 52) * scale);
		ctx.lineTo((x + 12) * scale, (y + 48) * scale);
		ctx.lineTo((x + 5) * scale, (y + 30) * scale);
		ctx.lineTo((x + 12) * scale, (y + 12) * scale); */
		var img = new Image();
		img.src = "svg/watermelon.svg";
		if(img.complete) {
			ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);
		} else {
			img.onload = function() {
				ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);
			};
		}
	} else if(type == 7) { // 白色的十二边形  还是做成圆吧
		/* color = "#D3D3D3";
		ctx.arc((x + 30) * scale, (y + 30) * scale, 25 * scale, 0, 2 * Math.PI); */
		var img = new Image();
		img.src = "svg/coconut.svg";
		if(img.complete) {
			ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);
		} else {
			img.onload = function() {
				ctx.drawImage(img, x * scale, y * scale, 60 * scale, 60 * scale);
			};
		}
	}

	//ctx.closePath();

	

	//边框
	//ctx.strokeStyle = "black";
	//ctx.lineWidth = 1;//线条宽度
	//ctx.miterLimit = 2;//斜接长度
	//ctx.stroke();

	//ctx.fillStyle = color;
	//ctx.fill();

	//阴影
	
}


function mouse_touch_down(x, y) {
	if(is_move_time || is_blast_time || is_drop_time || is_tips) return false;
	is_press = true;
	now_cols = parseInt(x / BLOCK_HEIGHT);
	now_rows = parseInt(y / BLOCK_WIDTH);
	//alert(focus_rows);
	if(focus_rows == -1) { // 如果当前没有选中状态，那么选中点击方块
		set_focus("add", now_rows, now_cols);
	} else { //  否则判断当前点击的方块是否为上次点击的方块
		if((focus_rows == now_rows) && (focus_cols == now_cols)) { // 如果当前点击的方块是上次点击的方块
			set_focus("cancel", focus_rows, focus_cols);
		} else if(Math.abs(focus_rows - now_rows + focus_cols - now_cols) == 1) { // 是新的方块，可以交换，那么取消选中并执行交换
			move(now_rows, now_cols, focus_rows, focus_cols, true);
		} else { //是新的方块 无法交换，那么取消之前的并选中新的
			set_focus("cancel", focus_rows, focus_cols);
			set_focus("add", now_rows, now_cols);
		}
	}
}
function mouse_touch_move(x, y) {

	if (! is_press || is_move_time || is_blast_time || is_drop_time || is_tips) return false;
	//alert(123);
	var this_cols = turn_coordinate(x);
	var this_rows = turn_coordinate(y);

	if (this_rows == focus_rows) {
		if ((this_cols > focus_cols) && (focus_cols < 7)) // 向右
			move(focus_rows, focus_cols, focus_rows, focus_cols + 1, true);
		else if ((this_cols < focus_cols) && (focus_cols > 0))
			move(focus_rows, focus_cols, focus_rows, focus_cols - 1, true);
	} else if (this_cols == focus_cols) {
		if ((this_rows > focus_rows) && (focus_rows < 7))
			move(focus_rows, focus_cols, focus_rows + 1, focus_cols, true);
		else if ((this_rows < focus_rows)  && (focus_rows > 0))
			move(focus_rows, focus_cols, focus_rows - 1, focus_cols, true);
	}
}
function mouse_touch_end() {
	if(is_tips) return false;
	set_focus("cancel", focus_rows, focus_cols);
	focus_rows = -1;
	focus_cols= -1;
	is_press = false;
}

function mouse_down(event) {
	mouse_touch_down(event.offsetX, event.offsetY);
}
function mouse_move(event) {
	mouse_touch_move(event.offsetX, event.offsetY);
}
function mouse_up(event) {
	is_press = false;
}


function turn_coordinate(sum) {
	return parseInt(sum / BLOCK_WIDTH);
}
function set_focus(mode, rows, cols) { // 将当前点击的坐标设置为点击状态
	var this_x = cols * BLOCK_WIDTH;
	var this_y = rows * BLOCK_HEIGHT;
	if(mode == "add") {
		focus_rows = now_rows;
		focus_cols = now_cols;
		ctx.strokeStyle = "#FD7418";
		ctx.globalCompositeOperation = "source-over";
	} else if(mode = "cancel") {
		focus_rows = -1;
		focus_cols = -1;
		ctx.strokeStyle = "#EEEEEE";
		ctx.globalCompositeOperation = "destination-out";
	}
	ctx.lineWidth = 2;

	ctx.shadowBlur = 0;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;

	ctx.beginPath();
	ctx.moveTo(this_x + 1,this_y + 15);
	ctx.lineTo(this_x + 1,this_y + 1);
	ctx.moveTo(this_x + 0,this_y + 1);
	ctx.lineTo(this_x + 15,this_y + 1);
	ctx.moveTo(this_x + 46,this_y + 1);
	ctx.lineTo(this_x + 60,this_y + 1);
	ctx.moveTo(this_x + 59,this_y + 0);
	ctx.lineTo(this_x + 59,this_y + 15);
	ctx.moveTo(this_x + 59,this_y + 46);
	ctx.lineTo(this_x + 59,this_y + 60);
	ctx.moveTo(this_x + 60,this_y + 60);
	ctx.lineTo(this_x + 46,this_y + 60);
	ctx.moveTo(this_x + 15,this_y + 59);
	ctx.lineTo(this_x + 0,this_y + 59);
	ctx.moveTo(this_x + 1,this_y + 60);
	ctx.lineTo(this_x + 1,this_y + 46);

	ctx.stroke();
}


function gameover(score, all_sum, one_sum, type) {
	var over = document.getElementById("over");
	over.load();
	over.play();
	
	var count = parseInt(localStorage.getItem("count")) + 1;
	localStorage.setItem("count", count);
	localStorage.setItem(count, "" + score + "," + (new Date()).valueOf());
	var info = type == 0 ? "无法移动" : "时间结束";
	if(TYPE == 1 && type == 0 && t1 != -1) {
		clearInterval(t1);
		is_time = false;
	}
	layer.open( {
		title: '游戏结束',
		shift: 3,
		content: "" + info + "！<br>您在本局游戏中共获得: " + score +" 分<br>总共消除: " + all_sum + " 个宝石<br>单次最多消除: " + one_sum + " 个宝石",
		btn: "再来一局",
		closeBtn: 0,
		yes: function() {
			restart();
			layer.closeAll();
		}
	});
};


function music() {
	var bgm = document.getElementById("bgm");
	if(bgm.paused) {
		bgm.play();
		is_music = true;
	} else {
		bgm.pause();
		is_music = false;
	}
};



function rank() {
	var count = parseInt(localStorage.getItem("count"));
	var content = "<div style=\"overflow-y:scroll;width:100%;height:100%\">" +
	              "<table class=\"bordered\"><thead><tr><th>排名</th><th>分数</th><th>时间</th></tr></thead>";
	var data = new Array(count);
	for(var i = 0; i < count; i++) {
		data[i] = localStorage.getItem(i + 1).split(",");
	}
	data.sort(function(a, b) {
		if(parseInt(a[0]) > parseInt(b[0]) || (parseInt(a[0]) == parseInt(b[0]) && a[1] <= b[1])) return -1;
		else return 1;
	});
	for(var i = 0; i < count; i++) {
		var score = data[i][0];
		var time = date(data[i][1]);
		content += "<tr><td>" + (i + 1) + "</td><td>" + score + "</td><td>" + time + "</td></tr>";
	}
	content += "</table></div>";
	layer.open( {
		type: 1,
title: '排行榜',
		shift: 3,
area: ["600px", "400px"],
content: content
	});
}


function scorehistory() {
	var count = parseInt(localStorage.getItem("count"));
	var content = "<div style=\"overflow-y:scroll;width:100%;height:100%\">" +
	              "<table class=\"bordered\"><thead><tr><th>分数</th><th>时间</th></tr></thead>";
	var data = new Array(count);
	for(var i = 0; i < count; i++) {
		data[i] = localStorage.getItem(i + 1).split(",");
	}
	data.sort(function(a, b) {
		if(a[1] >= b[1]) return -1;
		else return 1;
	});
	for(var i = 0; i < count; i++) {
		var score = data[i][0];
		var time = date(data[i][1]);
		content += "<tr><td>" + score + "</td><td>" + time + "</td></tr>";
	}
	content += "</table></div>";
	layer.open( {
		type: 1,
title: '历史数据',
		shift: 3,
area: ["600px", "400px"],
content: content
	});
}


function date(time) {
	var d = new Date(parseInt(time));
	var Y = d.getFullYear();
	var M = parseInt(d.getMonth());
	M = (M + 1) < 10 ? ("0" + (M + 1)) : (M + 1);
	var D = parseInt(d.getDate());
	D = D < 10 ? ("0" + D) : D;
	var h = parseInt(d.getHours());
	h = h < 10 ? ("0" + h) : h;
	var m = parseInt(d.getMinutes());
	m = m < 10 ? ("0" + m) : m;
	var s = parseInt(d.getSeconds());
	s = s < 10 ? ("0" + s) : s;
	return Y + "-" + M + "-" + D + " " + h + ":" + m + ":" + s;
}


function help() {
	layer.open( {
title: '帮助',
		shift: 3,
content: '操作方法：<br>(1)点击一个方块之后再点击另一个方块<br>(2)拖拽某个方块<br><br>支持浏览器：<br>Google Chrome, Mozilla FireFox<br>推荐使用Google Chrome浏览器获得最佳体验<br><br>made by myluo',
	});
}




function restart() {
	is_restart = true;
	is_tips = false;
	start();
}


function sleep(obj,iMinSecond) {
	if (window.eventList==null) window.eventList=new Array();
	var ind=-1;
	for (var i=0; i<window.eventList.length; i++) {
		if (window.eventList[i]==null) {
			window.eventList[i]=obj;
			ind=i;
			break;
			　　
		}
		　　
	}
	　　
	if (ind==-1) {
		ind=window.eventList.length;
		window.eventList[ind]=obj;
		　　
	}
	setTimeout("GoOn(" + ind + ")",1000);
	　　
}

function GoOn(ind) {
	var obj=window.eventList[ind];
	window.eventList[ind]=null;
	if (obj.NextStep) obj.NextStep();
	else obj();
	　　
}

function tips() {
	if (is_press || is_move_time || is_blast_time || is_drop_time || is_tips) return false;
	if(tip.length == 0) check_over();
	var index = tip[tipindex];
	if(tipindex == tip.length - 1) tipindex = 0;
	else tipindex++;

	var first = parseInt(index / 100);
	var second = index % 100;

	var x1 = parseInt(first / BLOCK_COLS);
	var y1 = first % BLOCK_COLS;
	var x2 = parseInt(second / BLOCK_COLS);
	var y2 = second % BLOCK_COLS;

	//alert(x1 + "," + y1 + "," + x2 + "," + y2)

	is_tips = true;
	set_focus("add", x1, y1);
	sleep(this,10);
	this.NextStep=function() {
		set_focus("cancel", x1, y1);
		sleep(this,10);
		this.NextStep=function() {
			if(is_tips) {
				set_focus("add", x2, y2);
				sleep(this,10);
				this.NextStep=function() {
					set_focus("cancel", x2, y2);
					is_tips = false;
				}
			}
		}
	}
}

function normal() {
	TYPE = 0;
	restart();
}

function timerial() {
	TYPE = 1;
	restart();
}



function start1() {

	if(myalpha == 0) {
		mybeta += 360 / ALLTIME;
	} else {
		mybeta += myalpha;
		myalpha = 0;
	}

	if(mybeta < 180) {
		$(".pie1").css("-o-transform","rotate(" + mybeta + "deg)");
		$(".pie1").css("-moz-transform","rotate(" + mybeta + "deg)");
		$(".pie1").css("-webkit-transform","rotate(" + mybeta + "deg)");
	} else {
		$(".pie2").css("backgroundColor", "#4a89dc");
		$(".pie2").css("-o-transform","rotate(" + mybeta + "deg)");
		$(".pie2").css("-moz-transform","rotate(" + mybeta + "deg)");
		$(".pie2").css("-webkit-transform","rotate(" + mybeta + "deg)");
	}

	if(mybeta >= 360) {
		mybeta = 0;
		clearInterval(t1);
		is_time = false;
		gameover(SCORE, ALL_SUM, ONE_SUM, 1);
	}
}


function addtime(times) {
	var addbeta = -360 / ALLTIME * times;
	var newbeta = mybeta + addbeta;
	myalpha = newbeta >= 0 ? addbeta : (-mybeta);
	if(mybeta > 180 && newbeta < 180) {
		$(".pie2").css("-o-transform","rotate(0deg)");
		$(".pie2").css("-moz-transform","rotate(0deg)");
		$(".pie2").css("-webkit-transform","rotate(0deg)");
		$(".pie2").css("backgroundColor", "#fff");
	}
}


function cleartime() {
	$(".pie1").css("-o-transform","rotate(0deg)");
	$(".pie1").css("-moz-transform","rotate(0deg)");
	$(".pie1").css("-webkit-transform","rotate(0deg)");
	$(".pie2").css("backgroundColor", "#fff");
	$(".pie2").css("-o-transform","rotate(0deg)");
	$(".pie2").css("-moz-transform","rotate(0deg)");
	$(".pie2").css("-webkit-transform","rotate(0deg)");
	mybeta = 0;
	myalpha = 0;
}


function countDown() {
	cleartime();
	t1 = setInterval("start1()", 100);
	is_time = true;
}