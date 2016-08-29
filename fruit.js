
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

var is_move_time = false;// 当前是否有方块正在移动
var is_blast_time = false; // 当前是否有方块正在消除
var is_drop_time = false; // 当前是否有方块正在下落

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

var block = new Array();//用于保存每个方块的类型
var block_status = new Array();//用于保存每个方块的状态

for(var i = 0; i < BLOCK_ROWS; i++)
{
	block[i] = new Array();
	block_status[i] = new Array();
	for(var j = 0; j <= BLOCK_COLS; j++)
	{
		block[i][j] = -1;
		block_status[i][j] = 0;
	}
}
start();

//document.onkeydown = key_down;
//document.onkeyup = key_up;

function start()
{
	SCORE = 0;
	ALL_SUM = 0;
	ONE_SUM = 0;
	ctx.clearRect(0, 0, BLOCK_WIDTH * BLOCK_COLS, BLOCK_HEIGHT * BLOCK_ROWS);
	for(var i = 0; i < BLOCK_ROWS; i++)
		for(var j = 0; j < BLOCK_COLS; j++)
			{
				rand = get_rand();
				block[i][j] = rand;
				block_status[i][j] = 0;
				shape(rand, turn_pixel(j), turn_pixel(i), 0, 1);
			}
	//if (check_blast(-1, -1, -1, -1, -1, -1, true, "")) start(); // 直到开局无法自动消除为止
	
	document.getElementById("score").innerHTML = SCORE;
}


function check_blast(obj_rows, obj_cols, obj_type, orl_rows, orl_cols, orl_type, mode, special) // mode如果为true 那么返回可以消除方块的数量，否则直接执行消除，用于初始化地图做判断
{
	if(is_blast_time) return false;
	var i = 0;
	var j = 0;
	var turn = false;
	var num = 0;
	var array_rows = new Array();//待消除列表
	var array_cols = new Array();
	
	//if (special == "")
	//{
	if (obj_type == -1) // 参数全为-1则为全图检测
	{
		var vertical_rows = new Array();
		var vertical_cols = new Array();
		var flat_rows = new Array();
		var flat_cols = new Array();
		
		for (var k = 0; k < BLOCK_ROWS; k++)
			for (var l = 0; l < BLOCK_COLS; l++)
			{
				type = block[k][l];
				vertical_rows = [];
				vertical_cols = [];
				flat_rows = [];
				flat_cols = [];
				
				i = 0;
				while(block[k][l + i] == type)
				{
					flat_rows[i] = k;
					flat_cols[i] = l + i;
					i++;
				}
				
				i = 0;
				while(block[k + i][l] == type)
				{
					vertical_rows[i] = k + i;
					vertical_cols[i] = l;
					i++;
				}
				
				check_special(flat_rows, flat_cols, vertical_rows, vertical_cols);
				
				if(flat_rows.length >= 3)
				for(var m = 0; m < flat_rows.length; m++)
				{
					if (flat_rows[m] != -1)
					{
					array_rows[num] = flat_rows[m];
					array_cols[num] = flat_cols[m];
					num++;
					}
				}
				
				if(vertical_rows.length >= 3)
				for(var m = 0; m < vertical_rows.length; m++)
				{
					if (flat_rows[m] != -1)
					{
					array_rows[num] = vertical_rows[m];
					array_cols[num] = vertical_cols[m];
					num++;
					}
				}
			}
		if (mode) return num;
	}
	else
	{
		//orl_type = block[orl_rows][orl_cols];
		//obj_type = block[obj_rows][obj_cols];
		var orl_vertical_rows = new Array();
		var orl_vertical_cols = new Array();
		var orl_flat_rows = new Array();
		var orl_flat_cols = new Array();
		var obj_vertical_rows = new Array();
		var obj_vertical_cols = new Array();
		var obj_flat_rows = new Array();
		var obj_flat_cols = new Array();
		
		// var obj_block = block[obj_rows][obj_cols];
		// var orl_block = block[orl_rows][orl_cols];
		
		while(true)
		{
			if (block[orl_rows][orl_cols + i] == orl_type)
			{
				orl_flat_rows[j] = orl_rows;
				orl_flat_cols[j] = orl_cols + i;
				j++;
			}
			else
			{
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
		while(true)//上下
		{
			if (block[orl_rows + i][orl_cols] == orl_type)
			{
				orl_vertical_rows[j] = orl_rows + i;
				orl_vertical_cols[j] = orl_cols;
				j++;
			}
			else
			{
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
		while(true)
		{
			if (block[obj_rows][obj_cols + i] == obj_type)
			{
				obj_flat_rows[j] = obj_rows;
				obj_flat_cols[j] = obj_cols + i;
				j++;
			}
			else
			{
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
		while(true)
		{
			if (block[obj_rows + i][obj_cols] == obj_type)
			{
				obj_vertical_rows[j] = obj_rows + i;
				obj_vertical_cols[j] = obj_cols;
				j++;
			}
			else
			{
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
		//check_special(orl_flat_rows, orl_flat_cols, orl_vertical_rows, orl_vertical_cols);
		//check_special(obj_flat_rows, obj_flat_cols, obj_vertical_rows, obj_vertical_cols);
		// alert(orl_flat_rows +"\n"+orl_flat_cols+"\n"+orl_vertical_rows+"\n"+orl_vertical_cols+"\n"+obj_flat_rows+"\n"+obj_flat_cols+"\n"+obj_vertical_rows+"\n"+obj_vertical_cols);
		if(orl_flat_rows.length >= 3)
			for(var k = 0; k < orl_flat_rows.length; k++)
			{
				if (orl_flat_rows[k] != -1)
				{
					array_rows[num] = orl_flat_rows[k];
					array_cols[num] = orl_flat_cols[k];
					num++;
				}
			}
		if(orl_vertical_rows.length >= 3)
			for(var k = 0; k < orl_vertical_rows.length; k++)
			{
				if (orl_flat_cols[k] != -1)
				{
				array_rows[num] = orl_vertical_rows[k];
				array_cols[num] = orl_vertical_cols[k];
				num++;
				}
			}
		if(obj_flat_rows.length >= 3)
			for(var k = 0; k < obj_flat_rows.length; k++)
			{
				if (obj_flat_rows[k] != -1)
				{
				array_rows[num] = obj_flat_rows[k];
				array_cols[num] = obj_flat_cols[k];
				num++;
				}
			}
		if(obj_vertical_rows.length >= 3)
			for(var k = 0; k < obj_vertical_rows.length; k++)
			{
				if (obj_vertical_rows[k] != -1)
				{
				array_rows[num] = obj_vertical_rows[k];
				array_cols[num] = obj_vertical_cols[k];
				num++;
				}
			}
		if (mode) return num;
	}
	
	//}
	/* else if (special == "super") // 被触发了超能宝石
	{
		//alert ("super "+obj_type);
		num = 0;
		if (obj_type == -1) // 2颗宝石均为超能宝石，消全图
		{
			for (var k = 0; k < BLOCK_ROWS; k++)
				for (var l = 0; l < BLOCK_COLS; l++)
				{
					set_status(i, j, 0);
					array_rows[num] = k;
					array_cols[num] = l;
					num++;
				}
			
		}
		else 
		{
			
			for (var k = 0; k < BLOCK_ROWS; k++)
				for (var l = 0; l < BLOCK_COLS; l++)
					if (block[k][l] == obj_type)
					{
						//alert ("i: "+i+" j: "+j+" t: "+block[i][j]);
						array_rows[num] = k;
						array_cols[num] = l;
						num++;
					}
			
			set_status(obj_rows, obj_cols, 0);
			array_rows[num] = obj_rows;
			array_cols[num] = obj_cols;
			num++;
			//alert ("num = "+num+"o_r = "+obj_rows +"o_c = "+ obj_cols+"b_s"+ block_status[obj_rows][obj_cols]);
		}
	} */
	//alert("num: "+num+"\n"+array_rows+"\n"+array_cols);
	// 在消除列表里面找到特殊宝石，并响应
	/* if (num > 0) 
	{
		blast_special(array_rows, array_cols);
		add_score(array_rows.length, 0);
	} */

	
	
	
	if (num == 0) 
		move(obj_rows, obj_cols,orl_rows, orl_cols, false);
	else // 消除宝石
	{
		var time = 1;
		var change = false; // 用于判断放大还是缩小
		timer_blast = setInterval(function(){
			if(time > 0)
			{			
				is_blast_time = true;
				for(var k = 0; k < array_cols.length; k++)
				{
					ctx.clearRect(turn_pixel(array_cols[k]) - 2, turn_pixel(array_rows[k]) - 2, BLOCK_HEIGHT + 5, BLOCK_WIDTH + 5);  //Clear the canvas
					off = parseInt(BLOCK_WIDTH * 0.5 * (1 - time));
					shape(block[array_rows[k]][array_cols[k]], 1 / time * (turn_pixel(array_cols[k]) + off), 1 / time * (turn_pixel(array_rows[k]) + off), block_status[array_rows[k]][array_cols[k]], time);
				}
				if (! change && (time < 1.15))
					{
						time += 0.05;
						if (time >= 1.15) change = true;
					}
					else
						time -= 0.1;
			}
			else
			{
				//再清除一次图形，手机上会有无法消除的问题  依然无法解决
				for(var k = 0; k < array_cols.length; k++)
				{
					ctx.clearRect(turn_pixel(array_cols[k]) - 2, turn_pixel(array_rows[k]) - 2, BLOCK_HEIGHT + 5, BLOCK_WIDTH + 5); 
				}
				
				is_blast_time = false;
				clearInterval(timer_blast);
				for(var m = 0; m < array_rows.length; m++)
				{
					block[array_rows[m]][array_cols[m]] = 0;
					set_status(array_rows[m], array_cols[m], 0);
					ctx.clearRect(turn_pixel(array_cols[m]), turn_pixel(array_rows[m]), BLOCK_HEIGHT, BLOCK_WIDTH);
				}
				drop();
			}
		}, BLAST_TIME);
	}
}


function move(obj_rows, obj_cols, orl_rows, orl_cols, check)
{
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
	
	/* if ((orl_type == 8) && (obj_type == 8)) // 选择交换的2个宝石均为超能宝石
	{
		check_blast(-1, -1, -1, -1, -1, -1, false, "super");
		return true;
	}
	else if (orl_type == 8)
	{
		check_blast(orl_rows, orl_cols, obj_type, -1, -1, -1, false, "super");
		return true;
	}
	else if (obj_type == 8)
	{
		check_blast(obj_rows, obj_cols, orl_type, -1, -1, -1, false, "super");
		return true;
	} */
	//alert (obj_rows+" " + obj_cols+" " + orl_rows+" " + orl_cols +" " + obj_status+" " +orl_status);
	if(obj_rows == orl_rows) // 横向交换
	{
		if(obj_cols > orl_cols) //向右换
		{
			timer = setInterval(function()
			{   
				if(turn_pixel(obj_cols) >= cols)
				{
					is_move_time = true;
					ctx.clearRect(turn_pixel(orl_cols), turn_pixel(orl_rows), 2 * BLOCK_HEIGHT,  BLOCK_WIDTH);  //Clear the canvas
					shape(obj_type, cols2, rows2, obj_status, 1);
					shape(orl_type, cols, rows, orl_status, 1);
					cols += MOVE_PIXEL;
					cols2 -= MOVE_PIXEL;
				}
				else
				{
					is_move_time = false;
					clearInterval(timer);  //Stop setInterval() when it arrives
					block[orl_rows][orl_cols] = obj_type;
					block[obj_rows][obj_cols] = orl_type;
					set_status(orl_rows, orl_cols, obj_status);
					set_status(obj_rows, obj_cols, orl_status);
					if(check)
						check_blast(orl_rows, orl_cols, block[orl_rows][orl_cols], obj_rows, obj_cols, block[obj_rows][obj_cols], false, "");
				}
			}, MOVE_TIME);
		}
		else //向左换
		{
			timer = setInterval(function()
			{   
				if(turn_pixel(obj_cols) <= cols)
				{		
					is_move_time = true;
					ctx.clearRect(turn_pixel(obj_cols), turn_pixel(obj_rows), 2 * BLOCK_HEIGHT,  BLOCK_WIDTH);  //Clear the canvas
					shape(obj_type, cols2, rows2, obj_status, 1);
					shape(orl_type, cols, rows, orl_status, 1);
					cols -= MOVE_PIXEL;
					cols2 += MOVE_PIXEL;
				}
				else
				{
					is_move_time = false;
					clearInterval(timer);  //Stop setInterval() when it arrives
					block[orl_rows][orl_cols] = obj_type;
					block[obj_rows][obj_cols] = orl_type;
					set_status(orl_rows, orl_cols, obj_status);
					set_status(obj_rows, obj_cols, orl_status);
					if(check)
						check_blast(orl_rows, orl_cols, block[orl_rows][orl_cols], obj_rows, obj_cols, block[obj_rows][obj_cols], false, "");
				}
			}, MOVE_TIME);
		}
	}
	else if(obj_cols == orl_cols) // 纵向交换
	{
		if(obj_rows > orl_rows) //向下换
		{
			timer = setInterval(function()
			{
				if(turn_pixel(obj_rows) >= rows)
				{		
					is_move_time = true;
					ctx.clearRect(turn_pixel(orl_cols), turn_pixel(orl_rows), BLOCK_HEIGHT, BLOCK_WIDTH * 2);  //Clear the canvas
					shape(obj_type, cols2, rows2, obj_status, 1);
					shape(orl_type, cols, rows, orl_status, 1);
					rows += MOVE_PIXEL;
					rows2 -= MOVE_PIXEL;
				}
				else
				{
					is_move_time = false;
					clearInterval(timer);  //Stop setInterval() when it arrives
					block[orl_rows][orl_cols] = obj_type;
					block[obj_rows][obj_cols] = orl_type;
					set_status(orl_rows, orl_cols, obj_status);
					set_status(obj_rows, obj_cols, orl_status);
					if(check)
						check_blast(orl_rows, orl_cols, block[orl_rows][orl_cols], obj_rows, obj_cols, block[obj_rows][obj_cols], false, "");
				}
			}, MOVE_TIME);
		}
		else // 向上换
		{
			timer = setInterval(function()
			{
				if(turn_pixel(obj_rows) <= rows)
				{			
					is_move_time = true;
					ctx.clearRect(turn_pixel(obj_cols), turn_pixel(obj_rows), BLOCK_HEIGHT, BLOCK_WIDTH * 2);  //Clear the canvas
					shape(obj_type, cols2, rows2, obj_status, 1);
					shape(orl_type, cols, rows, orl_status, 1);
					rows -= MOVE_PIXEL;
					rows2 += MOVE_PIXEL;
				}
				else
				{
					is_move_time = false;
					clearInterval(timer);
					block[orl_rows][orl_cols] = obj_type;
					block[obj_rows][obj_cols] = orl_type;
					set_status(orl_rows, orl_cols, obj_status);
					set_status(obj_rows, obj_cols, orl_status);
					if(check)
						check_blast(orl_rows, orl_cols, block[orl_rows][orl_cols], obj_rows, obj_cols, block[obj_rows][obj_cols], false, "");
				}
			}, MOVE_TIME);
		}
	}
}


function drop()
{
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
	
	for (var i = -1; i <= BLOCK_ROWS; i++)
		{
			need[i] = new Array();
			need_max[i] = new Array();
			is_do[i] = new Array();
			list[i] = new Array();
			is_drop_block[i] = new Array();
		}
	for (var i = 0; i < BLOCK_ROWS; i++)
	{
		for (var j = 0; j < BLOCK_COLS; j++)
		{
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
	for (var i = 0; i < BLOCK_ROWS; i++)
	{
		for (var j = 0; j < BLOCK_COLS; j++)
		{
			if (block[i][j] == 0)
			{
				for (var k = 0; k < i; k++)
				{
					if(block[k][j] != 0)
					{
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
	for (var i = 0; i < BLOCK_ROWS; i++)
	{
		line_max[i] = 0;
		list_max[i] = 0;
		for (var j = 0; j < BLOCK_COLS; j++)
		{
			//if(need[j][i] > line_max[i]) line_max[i] = need[j][i];
			if(need[j][i] == -1) 
			{
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
	for (var i = 0; i < BLOCK_COLS; i++)
	{
		var j = 0;
		while (line_max[i] > 0)
		{
			list[i][j] = get_rand();;
			line_max[i] -= BLOCK_WIDTH;
			j++;
		}
	}
	
	timer_drop = setInterval(function()
	{
		is_drop_time = true;
		if(max_drop > 0)
		{
			for (var i = 0; i < BLOCK_ROWS; i++)
				for (var j = 0; j < BLOCK_COLS; j++)
					if(is_drop_block[i][j])
						ctx.clearRect(turn_pixel(j), turn_pixel(i), BLOCK_HEIGHT, BLOCK_WIDTH);
			
			for (var i = 0; i < BLOCK_ROWS; i++)
				is_line_draw[i] = 0;
				
			for (var i = 0; i < BLOCK_ROWS; i++)
				for (var j = 0; j < BLOCK_COLS; j++)
					if (is_drop_block[i][j])
						if(need[i][j] > 0) // 处于下落中的方块
						{
							if (is_do[i][j] < need_max[i][j])
								is_do[i][j] += DROP_PIXEL;
							shape(block[i][j], turn_pixel(j), turn_pixel(i) + is_do[i][j], block_status[i][j], 1);
						}
						else if (need[i][j] == 0) // 已经停止的方块
							shape(block[i][j], turn_pixel(j), turn_pixel(i),  block_status[i][j], 1);
						else if ((need[i][j] == -1) && (is_line_draw[j] == 0)) // 对于被消除的方块而言，新生成的方块
						{
							is_line_draw[j] = 1;
							if (is_do[i][j] < list_need[j])
								is_do[i][j] += DROP_PIXEL;
							for (var k = 0; k < turn_coordinate(list_max[j]); k++)
								if (list[j][k] > 0)
									shape(list[j][k], turn_pixel(j),is_do[i][j] - turn_pixel(k +1), 0, 1);
						}
			max_drop -= DROP_PIXEL;
		}
		else
		{
			is_drop_time = false;
			clearInterval(timer_drop);
			for (var i = BLOCK_ROWS - 1 ;i >= 0; i--)
				for (var j = BLOCK_COLS -1 ;j >= 0; j--)
				{
					if (block[i][j] == 0) // 对消除后的方块的状态进行转移，正确调整至下落后的状态
					{
						var k = 0;
						var sum = 0;
						while(sum == 0)
						{
							k++;
							if (i - k < 0) // 如果是第一行的，那么就从list中取新生成的方块
							{
								sum = list[j][0];
								for (var l = 1; l < list[j].length; l++)
									list[j][l - 1] = list[j][l];
							}
							else// 否则就拿上一行的方块
								sum = block[i - k][j];
						}
						
						if (i - k < 0)
						{
							block[i][j] = sum;
							set_status(i, j, 0);
						}
						else
						{
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
			check_blast(-1, -1, -1, -1, -1, -1, false, "");
			check_over();
		}
	}, DROP_TIME);
}


function get_rand()
{
	rand = parseInt(Math.random() * BLOCK_TYPE) + 1;
	while (rand == 8)
		rand = parseInt(Math.random() * BLOCK_TYPE) + 1;
	return rand;
}

function turn_pixel(sum)
{
	return sum * BLOCK_WIDTH;
}

function shape(type, x, y, status, scale)
{
	var color;
	//var shadow_color;
	ctx.beginPath();
	if(type == 1) //紫色的三角形 
	{
		color = "#E50CE6";
		ctx.moveTo((x + 30) * scale, (y + 5)* scale);
		ctx.lineTo((x + 55) * scale, (y + 55) * scale);
		ctx.lineTo((x + 5) * scale, (y + 55) * scale);
	}
	else if(type == 2) //黄色的四边形 菱形
	{
		color = "#F9CC16";
		ctx.moveTo((x + 30) * scale, (y + 5) * scale);
		ctx.lineTo((x + 55) * scale, (y + 30) * scale);
		ctx.lineTo((x + 30) * scale, (y + 55) * scale);
		ctx.lineTo((x + 5) * scale, (y + 30) * scale);
	}
	else if(type == 3) //蓝色的五边形 钻石
	{
		color = "#0B73F0";
		ctx.moveTo((x + 20) * scale, (y + 5) * scale);
		ctx.lineTo((x + 40) * scale, (y + 5) * scale);
		ctx.lineTo((x + 55) * scale, (y + 20) * scale);
		ctx.lineTo((x + 30) * scale, (y + 55) * scale);
		ctx.lineTo((x + 5) * scale, (y + 20) * scale);
	}
	else if(type == 4) //橙色的六边形
	{
		color = "#F9862F";
		ctx.moveTo((x + 30) * scale, (y + 5) * scale);
		ctx.lineTo((x + 52) * scale, (y + 17) * scale);
		ctx.lineTo((x + 52) * scale, (y + 42) * scale);
		ctx.lineTo((x + 30) * scale, (y + 55) * scale);
		ctx.lineTo((x + 8) * scale, (y + 42) * scale);
		ctx.lineTo((x + 8) * scale, (y + 17) * scale);
	}
	else if(type == 5) //红色的八边形
	{
		color = "#EA1530";
		ctx.moveTo((x + 16) * scale, (y + 8) * scale);
		ctx.lineTo((x + 44) * scale, (y + 8) * scale);
		ctx.lineTo((x + 52) * scale, (y + 16) * scale);
		ctx.lineTo((x + 52) * scale, (y + 44) * scale);
		ctx.lineTo((x + 44) * scale, (y + 52) * scale);
		ctx.lineTo((x + 16) * scale, (y + 52) * scale);
		ctx.lineTo((x + 8) * scale, (y + 44) * scale);
		ctx.lineTo((x + 8) * scale, (y + 16) * scale);
	}
	else if(type == 6) //绿色的十边形
	{
		color = "#27C941";
		ctx.moveTo((x + 22) * scale, (y + 8) * scale);
		ctx.lineTo((x + 36) * scale, (y + 8) * scale);
		ctx.lineTo((x + 48) * scale, (y + 12) * scale);
		ctx.lineTo((x + 55) * scale, (y + 30) * scale);
		ctx.lineTo((x + 48) * scale, (y + 48) * scale);
		ctx.lineTo((x + 36) * scale, (y + 52) * scale);
		ctx.lineTo((x + 22) * scale, (y + 52) * scale);
		ctx.lineTo((x + 12) * scale, (y + 48) * scale);
		ctx.lineTo((x + 5) * scale, (y + 30) * scale);
		ctx.lineTo((x + 12) * scale, (y + 12) * scale);
	}
	else if(type == 7) // 白色的十二边形  还是做成圆吧
	{
		color = "#D3D3D3";
		ctx.arc((x + 30) * scale, (y + 30) * scale, 25 * scale, 0, 2 * Math.PI);
	}
	
	ctx.closePath();

	ctx.globalCompositeOperation = "source-over";
	
	//边框
	ctx.strokeStyle = "black";
	ctx.lineWidth = 1;//线条宽度
	ctx.miterLimit = 2;//斜接长度
	ctx.stroke();
	
	ctx.fillStyle = color;
	ctx.fill();
	
	//阴影
	ctx.shadowBlur = 4;
	ctx.shadowColor = "black";
	ctx.shadowOffsetX = 1;
	ctx.shadowOffsetY = 1;
}


