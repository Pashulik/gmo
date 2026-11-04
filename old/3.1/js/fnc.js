//~ Версия 3.1
//~ Основной скрипт, крайне не рекомендуется что-либо менять

var nominatedOrder = [];

// Настройки таймеров (будут перезаписаны из localStorage)
window.$timerSettings1 = window.$timerSettings1 || { enabled: true, duration: 60, beepDuration: 0.1, beepFreq: 1200, beepVolume: 0.6, alarmDuration: 1.5, alarmFreq: 1200, alarmVolume: 0.8 };
window.$timerSettings2 = window.$timerSettings2 || { enabled: true, duration: 30, beepDuration: 0.1, beepFreq: 1200, beepVolume: 0.6, alarmDuration: 1.5, alarmFreq: 1200, alarmVolume: 0.8 };

$(document).ready(function () {
    $titleRole = "Роль";
    $titleName = "Игрок";
    //Скрыть все содержание
    for ($i = 1; $i <= 3; $i++) {
        $("#content #tab" + $i).hide();
    }
    $(".clNames").html($titleName);
    // Добавляем таймер длительности игры
    $(".clNums").html("🕒 00:00");
    $gameTimer = null;
    $gameTime = 0;

    // Инициализация переменных для фолов
    window.$useFoulsDay = typeof $useFoulsDay !== "undefined" ? $useFoulsDay : false;
    window.$useFoulsNight = typeof $useFoulsNight !== "undefined" ? $useFoulsNight : true;
    window.$maxFoul = typeof $maxFoul !== "undefined" ? $maxFoul : 5;

    $(".clRoles").html($titleRole);
    $("#tabs li:first").attr("id", "current"); // Активируем первую закладку
    $("#content #tab1").fadeIn(); // Выводим содержание

    $("#tabs a").click(function (e) {
        e.preventDefault();
        //Скрыть все содержание
        for ($i = 1; $i <= 3; $i++) {
            $("#content #tab" + $i).hide();
        }
        $("#tabs li").attr("id", ""); //Сброс ID
        $(this).parent().attr("id", "current"); // Активируем закладку
        $("#" + $(this).attr("title")).fadeIn(); // Выводим содержание текущей закладки
    });

    // Переводим в текст все названия кнопок, так как они могут быть заданы в виде &#8258;
    if (typeof $arBtnTitles !== "undefined" && $arBtnTitles.length) {
        for (i = 1; i < $arBtnTitles.length; i++) {
            $arBtnTitles[i] = $("<div/>").html($arBtnTitles[i]).text();
        }
    }
	
    // Краткое описание ролей
    s =
        "<h4>Обозначения:</h4><strong>" +
        $arBtnTitles[1] +
        "</strong> - Убийство мафией<br /><strong>" +
        $arBtnTitles[2] +
        "</strong> - Вор крадёт способность<br /><strong>" +
        $arBtnTitles[3] +
        "</strong> - Доктор лечит<br /><strong>" +
        $arBtnTitles[4] +
        "</strong> - Комиссар проверяет<br />" +
        $arBtnTitles[5] +
        "</strong> - Красотка спасает<br /><strong>" +
        $arBtnTitles[6] +
        "</strong> - Маньяк действует<br />" +
        $arBtnTitles[7] +
        "</strong> - расстрел днём<br /><strong>" +
        $arBtnTitles[8] +
        "</strong> - взрыв смертника<br />" +
        $arBtnTitles[9] +
        "</strong> - фол игроку<br /><br />";
    $("#dInfoSigns").html(s);

    // Регулярка для выделения номера игрока при определении ролей
    $regRole = /sRole(\d+)/;
    // Регулярка для выделения номера игрока и кода действия при обработке действий
    $regID = /g(\d+)b(\d+)/;
    // Регулярка для выделения номера игрока из элемента строки
    $regRowID = /tr(\d+)/;

    // Функции для работы с настройками ролей
    window.saveRoleSettings = function () {
        for (let i = 3; i <= 11; i++) {
            let checkbox = $("#rolePlay" + i);
            let minInput = $("#roleMin" + i);

            if (checkbox.length) {
                $arRolePlay[i] = checkbox.is(":checked") ? 1 : 0;
            }

            if (minInput.length) {
                let minValue = parseInt(minInput.val());
                if (!isNaN(minValue) && minValue >= 1) {
                    $arRoleMinPlayers[i] = minValue;
                }
            }
        }

        // Обновляем select с ролями в интерфейсе
        updateRoleSelects();

        // Показываем сообщение о сохранении
        showSettingsMessage("Настройки ролей сохранены!");

        if ($Debug) console.log("Настройки ролей сохранены:", $arRolePlay, "Минимумы:", $arRoleMinPlayers);
    };

    window.resetRoleSettings = function () {
        // Значения по умолчанию для сброса ролей в настройках
        let defaultSettings = {
            3: 1, // Дон
            4: 1, // Шериф
            5: 0, // Доктор
            6: 0, // Красотка
            7: 1, // Маньяк
            8: 0, // Бессмертный
            9: 0, // Вор
            10: 0, // Смертник
            11: 1, // Шахид
        };

        // Минимумы по умолчанию
        let defaultMins = {
            3: 7, // Дон
            4: 7, // Шериф
            5: 6, // Доктор
            6: 7, // Красотка
            7: 12, // Маньяк
            8: 7, // Бессмертный
            9: 11, // Вор
            10: 15, // Смертник
            11: 15, // Шахид
        };

        // Обновляем массив и чекбоксы
        for (let i = 3; i <= 11; i++) {
            $arRolePlay[i] = defaultSettings[i];
            $arRoleMinPlayers[i] = defaultMins[i];

            let checkbox = $("#rolePlay" + i);
            let minInput = $("#roleMin" + i);

            if (checkbox.length) {
                checkbox.prop("checked", defaultSettings[i] === 1);
            }

            if (minInput.length) {
                minInput.val(defaultMins[i]);
            }
        }

        // Обновляем select с ролями в интерфейсе
        updateRoleSelects();

        // Показываем сообщение о сбросе
        showSettingsMessage("Настройки ролей сброшены к значениям по умолчанию!");

        if ($Debug) console.log("Настройки ролей сброшены");
    };

    window.loadRoleSettingsToUI = function () {
        for (let i = 3; i <= 11; i++) {
            let checkbox = $("#rolePlay" + i);
            let minInput = $("#roleMin" + i);

            if (checkbox.length) {
                checkbox.prop("checked", $arRolePlay[i] === 1);
            }

            if (minInput.length && typeof $arRoleMinPlayers[i] !== "undefined") {
                minInput.val($arRoleMinPlayers[i]);
            }
        }
    };

    window.updateRoleSelects = function () {
        // Создаем новый select HTML на основе текущих настроек
        let newSelect = "<select>";
        for (let i = 1; i < $arRoles.length; i++) {
            if (i <= 2 || $arRolePlay[i] === 1) {
                // Мирный и Мафия всегда доступны
                newSelect = newSelect + '<option value="' + i + '">' + $arRoles[i] + "</option>";
            }
        }
        newSelect = newSelect + "</select>";

        // Обновляем все select'ы, которые не в заголовке
        $(".clRoles").each(function () {
            if ($titleRole != $(this).html() && $(this).find("select").length) {
                let currentValue = $(this).find("select").val();
                $(this).html(newSelect);
                if (currentValue) {
                    // Пытаемся восстановить выбранное значение, если оно доступно
                    if ($(this).find('option[value="' + currentValue + '"]').length) {
                        $(this).find("select").val(currentValue);
                    }
                }
            }
        });
    };

	window.showSettingsMessage = function (message, type) {
		$(".settings-message").remove();
		var bgColor = (type === 'warning') ? '#FF9800' : '#4CAF50';
		var msgDiv = $(
			'<div class="settings-message" style="position:fixed; top:20px; right:20px; background:' + bgColor + '; color:white; padding:10px 20px; border-radius:5px; z-index:10000; box-shadow:0 2px 10px rgba(0,0,0,0.2);">' +
				message +
			"</div>"
		);
		$("body").append(msgDiv);
		setTimeout(function () {
			msgDiv.fadeOut(500, function () {
				$(this).remove();
			});
		}, 3000);
	};	
	
    $cssFolder = "css/";

    $classHeader = "sHeader";
    $classMaff = "roleMaff";
    $classManiac = "roleManiac";
    $classSherif = "roleSherif";
    $classShahid = "roleShahid";
    $classDie = "gamerDie";
    $classBtnSelected = "btnSelected";
    $classBomber = "roleBomber"; // Смертник
    // Мирные и мафиози всегда в игре
    $arRolePlay[1] = 1;
    $arRolePlay[2] = 1;
    window.$maniacKills = typeof $maniacKills !== "undefined" ? $maniacKills : true;

    // Инициализация переменных маньяка
    if (typeof $maniacKills === "undefined") {
        $maniacKills = true; // По умолчанию маньяк убивает
    }

    if ($Debug) $("#dDebug").css("visibility", "visible");

    // Кнопки и первоначальное значение переменных
    // Список ролей
    // Было:
    // $select='<select>';
    // for (i=1;i<$arRoles.length;i++)
    //     if (1==$arRolePlay[i]) $select=$select+'<option value="'+i+'">'+$arRoles[i]+'</option>';
    // $select=$select+'</select>';

    // Стало:
    $select = generateRoleSelect();
    $br = "<br />";
    $btnNight = '<input id="btnNight" type="button" onclick="RoundAdd(1)" value="Ночь" />';
    $btnDay = '<input id="btnDay" type="button" onclick="RoundAdd(2)" value="День" disabled />';
    $timerID1 = $timerID2 = $rows = $gamers = $died = $sitizenCnt = $maffCnt = 0;
    $idImmortal =
        $idMedic =
        $idBeauty =
        $idDetective =
        $idManiac =
        $idThief =
        $idBoss =
        $idMaff =
        $maffCnt =
        $idBomber =
        $idShahid =
            0;
    $inGame = false;
    $die = $bdie = $cure = $bcure = $stole = $boom = $foul = 0;
    $SelfCure = false;

    function generateRoleSelect() {
        let html = "<select>";
        for (let i = 1; i < $arRoles.length; i++) {
            if ($arRolePlay[i] === 1) {
                html += '<option value="' + i + '">' + $arRoles[i] + "</option>";
            }
        }
        html += "</select>";
        return html;
    }

    // Назначаем роли
    $("#btnSpreadRoles").click(function () {
        if (1 <= $maffCnt) {
            if (!confirm("Точно пересдать роли?")) return false;
        }
        $arSpread = Array();

        // Определяем количество игроков
        let gamersCount = $gamers;

        // Добавляем одну Мафию
        $arSpread.push($arRoles[2]);

        // Добавляем Шерифа (если роль включена и достигнут минимум)
        if ($arRolePlay[4] == 1 && gamersCount >= $arRoleMinPlayers[4]) {
            $arSpread.push($arRoles[4]);
        }

        // Добавляем Доктора (если роль включена и достигнут минимум)
        if ($arRolePlay[5] == 1 && gamersCount >= $arRoleMinPlayers[5]) {
            $arSpread.push($arRoles[5]);
        }

        // Добавляем Красотку (если роль включена и достигнут минимум)
        if ($arRolePlay[6] == 1 && gamersCount >= $arRoleMinPlayers[6]) {
            $arSpread.push($arRoles[6]);
        }

        // Добавляем Бессмертного (если роль включена и достигнут минимум)
        if ($arRolePlay[8] == 1 && gamersCount >= $arRoleMinPlayers[8]) {
            $arSpread.push($arRoles[8]);
        }

        // Добавляем Дона мафии (если роль включена и достигнут минимум)
        if ($arRolePlay[3] == 1 && gamersCount >= $arRoleMinPlayers[3]) {
            $arSpread.push($arRoles[3]);
        }

        // Добавляем Маньяка (если роль включена и достигнут минимум)
        if ($arRolePlay[7] == 1 && gamersCount >= $arRoleMinPlayers[7]) {
            $arSpread.push($arRoles[7]);
        }

        // Добавляем Вора (если роль включена и достигнут минимум)
        if ($arRolePlay[9] == 1 && gamersCount >= $arRoleMinPlayers[9]) {
            $arSpread.push($arRoles[9]);
        }

        // Добавляем Смертника (если роль включена и достигнут минимум)
        if ($arRolePlay[10] == 1 && gamersCount >= $arRoleMinPlayers[10]) {
            $arSpread.push($arRoles[10]);
        }

        // Добавляем Шахида (если роль включена и достигнут минимум)
        if ($arRolePlay[11] == 1 && gamersCount >= $arRoleMinPlayers[11]) {
            $arSpread.push($arRoles[11]);
        }

        // Добавляем дополнительные Мафии в зависимости от количества игроков
        if (gamersCount >= 10) $arSpread.push($arRoles[2]); // 3-я мафия
        if (gamersCount >= 12) $arSpread.push($arRoles[2]); // 4-я мафия
        if (gamersCount >= 15) $arSpread.push($arRoles[2]); // 5-я мафия

        // Очистка всех ролей, которые были ранее назначены
        $("#cover").find("select").val(1); // 1 – индекс роли "Мирный"

        // Собираем id span'ов, которые у нас есть в столбце ролей, чтобы назначить случайно роли
        $arSpan = Array();
        $("#cover")
            .find("select")
            .each(function () {
                $arSpan.push($(this).parent().attr("id"));
            });

        // Прогоняем цикл по подобранным ролям, чтобы назначить их случайным игрокам
        for ($i = 0; $i < $arSpread.length; $i++) {
            // Выбираем номер случайного игрока
            let n = Math.floor(Math.random() * $arSpan.length);
            let attempts = 0;
            let maxAttempts = 100; // Защита от бесконечного цикла

            // Проверяем, что этому игроку не назначена уже роль, если назначена, то выбираем номер снова
            while (
                $arRoles[1] !=
                    $("#" + $arSpan[n])
                        .find("option:selected")
                        .html() &&
                attempts < maxAttempts
            ) {
                n = Math.floor(Math.random() * $arSpan.length);
                attempts++;
            }

            // Назначаем очередную роль выбранному игроку
            $("#" + $arSpan[n])
                .find("select")
                .val($arRoles.indexOf($arSpread[$i]));
        }

        // Подсчитываем остатки мафии (для вора)
        countMaff();

        // Показываем сообщение о раздаче ролей
        showSettingsMessage("Роли успешно распределены!");
    });

    // Начинаем игру
    $("#btnBegin").click(function () {
        // Устанавливаем переменные в начальное состояние
        $round = 0;
        $inGame = true;
        // Запускаем таймер игры
        $gameTime = 0;
        updateGameTimerDisplay();
        if ($gameTimer) clearInterval($gameTimer);
        $gameTimer = setInterval(function () {
            $gameTime++;
            updateGameTimerDisplay();
        }, 1000);
        $SelfCure = false;
        $idImmortal =
            $idMedic =
            $idBeauty =
            $idDetective =
            $idManiac =
            $idThief =
            $idBoss =
            $idMaff =
            $maffCnt =
            $idBomber =
            $idShahid =
                0;
        $die = $bdie = $cure = $bcure = $stole = $boom = $foul = 0;
        // Очищаем информацию для дебага
        if ($Debug) $("#dDebug").html("");
        // Отключаем добавление игроков
        $("#btnGamerAdd").prop("disabled", true);
        // Добавляем кнопки дня и ночи
        // Создаем две кнопки таймеров с разными значениями
        $btnTimer1 =
            '<input id="btnTimer1" type="button" onclick="StartTimer(1)" value="' + $waitTimerDefault1 + ' сек." />';
        $btnTimer2 =
            '<input id="btnTimer2" type="button" onclick="StartTimer(2)" value="' + $waitTimerDefault2 + ' сек." />';
        $("#dBtnRounds").html($btnNight + $br + $btnDay + $br + $btnTimer1 + $br + $btnTimer2);
        $(".sBtn").css("visibility", "hidden");
        // Исключаем повторное нажатие кнопки
        $("#btnBegin").prop("disabled", true);
        // Даём себе возможность начать заново
        $("#btnReset").prop("disabled", false);
        // Запоминаем имена игроков
        $("#cover")
            .find(":text")
            .each(function () {
                $(this).parent().html($(this).val());
            });
        // Запоминаем роли игроков
        $(".clRoles").each(function () {
            // Если это не заголовок, то обрабатываем
            if ($titleRole != $(this).html()) {
                // Определяем код игрока
                arr = $regRole.exec($(this).attr("id"));
                // Применяем роль к ячейке
                role = $(this).find("option:selected").html();
                $(this).html(role);

                // Отмечаем мафию цветом
                if ($arRoles[2] == role) setClass(arr[1], $classMaff);
                // Отмечаем маньяка цветом
                if ($arRoles[7] == role) setClass(arr[1], $classManiac);
                // Отмечаем шерифа цветом
                if ($arRoles[4] == role) setClass(arr[1], $classSherif);
                // Отмечаем шахида цветом
                if ($arRoles[11] == role) setClass(arr[1], $classShahid);

                // Запоминаем роль босса
                if ($arRoles[3] == role) {
                    $idBoss = arr[1];
                    setClass(arr[1], $classMaff);
                }
                // Запоминаем роль детектива
                if ($arRoles[4] == role) $idDetective = arr[1];
                // Запоминаем роль доктора
                if ($arRoles[5] == role) $idMedic = arr[1];
                // Запоминаем роль красотки
                if ($arRoles[6] == role) $idBeauty = arr[1];
                // Запоминаем роль маньяка
                if ($arRoles[7] == role) $idManiac = arr[1];
                // Запоминаем роль бессмертного
                if ($arRoles[8] == role) $idImmortal = arr[1];
                // Запоминаем роль вора
                if ($arRoles[9] == role) $idThief = arr[1];
                // Запоминаем роль террориста
                if ($arRoles[10] == role) $idBomber = arr[1];
                // Запоминаем роль шахида
                if ($arRoles[11] == role) $idShahid = arr[1];
                // Запоминаем роль террориста (Смертника)
                if ($arRoles[10] == role) {
                    $idBomber = arr[1];
                    setClass(arr[1], $classBomber);
                }
            }
        });
        // Подсчитываем остатки мафии
        countMaff();
    });

    // Сброс игры, начинаем заново
    $("#btnReset").click(function () {
        if (!confirm("Точно начать игру заново?")) return false;
        $inGame = false;
        // Останавливаем и сбрасываем таймер игры
        if ($gameTimer) {
            clearInterval($gameTimer);
            $gameTimer = null;
        }
        $gameTime = 0;
        updateGameTimerDisplay();
        // Отключаем кнопку, так как нет смысла в повторном сбросе
        $("#btnReset").prop("disabled", true);
        // Включаем добавление игроков
        $("#btnGamerAdd").prop("disabled", false);
        // Включаем назначение ролей
        $("#btnSpreadRoles").prop("disabled", false);
        // Убираем кнопки дня и ночи
        $("#dBtnRounds").html("&nbsp;");
        // Включаем снова возможность начать игру
        $("#btnBegin").prop("disabled", false);
        // Включаем управление игроками
        $(".sBtn").css("visibility", "visible");
        // Убираем фолы
        $(".foul").html("");
        // Удаляем раунды, если они были
        $(".clRound").remove();
        // Возвращаем возможность редактировать имена
        $(".clNames > span:first-child").each(function () {
            if ($titleName != $(this).html()) {
                $(this).html('<input type="text" class="left" value ="' + $(this).html() + '" />');
            }
        });
        // Возвращаем возможность выбирать роли
        $(".clRoles").each(function () {
            if ($titleRole != $(this).html()) {
                // Определяем код игрока
                arr = $regRole.exec($(this).attr("id"));
                // Получаем из ячейки роль
                role = $(this).html();
                $(this).html(generateRoleSelect());
                $(this).find("select").val(1); // 1 = Мирный
            }
        });
        // Убираем информацию об убитых и о мафиози
        $(".tr").removeClass($classDie);
        $(".tr").removeClass($classMaff);
        $(".tr").removeClass($classManiac);
        $(".tr").removeClass($classSherif);
        $(".tr").removeClass($classShahid);
        countMaff();
        StopTimer(1);
        StopTimer(2);
        updateRowsCount();
        clearVoteCheckboxes();
    });

	// Функция добавления строки игрока
	function addGamerRow() {
		$rows++;
		$gamers++;
		val = '';
		if ($Debug) val = "Игрок №" + $rows;

		$btnDel = '<span class="sBtn mousehand" onclick="GamerDel(' + $rows + ');">-</span>';
		$btnUp = '<span class="sBtn btnSmall mousehand" onclick="GamerUp(' + $rows + ');">▲</span>';
		$btnDown = '<span class="sBtn btnSmall mousehand" onclick="GamerDown(' + $rows + ');">▼</span>';

		let currentTimerValue = $(".clNums").html();

		s = '<div class="tr" id="tr' + $rows + '">';

		if ($rows === 0) {
			s += '<div class="td clNums" id="sNum' + $rows + '">' + currentTimerValue + '</div>';
		} else {
			s += '<div class="td clNums" id="sNum' + $rows + '"><span class="sDigit">' + $rows + '</span>' + $btnDel + $btnUp + $btnDown + '</div>';
		}

		s += '<div class="td clNames" id="sName' + $rows + '"><span class="left"><input type="text" class="left" value="' + val + '"/></span><span class="right foul" id="foul' + $rows + '"></span></div>';
		s += '<div class="td clRoles" id="sRole' + $rows + '">' + generateRoleSelect() + '</div>';
		s += '</div>';
		$('#cover').append(s);

		renum();
		updateRowsCount();
		$sitizenCnt = $gamers;
		showInfo();
	}

	// Привязываем кнопку "+" к функции
	$('#btnGamerAdd').click(addGamerRow);

	// Автоматически добавляем 7 игроков при загрузке
	for (var i = 0; i < 7; i++) {
		addGamerRow();
	}

    // Инициализация количества игроков при загрузке
    updateRowsCount();

    // Обработчик для чекбоксов
	$('#cover').delegate('.vote-checkbox', 'change', function() {
		var $cb = $(this);
		var playerId = $cb.data('player');
		var $tr = $('#tr' + playerId);
		
		if ($cb.is(':checked')) {
			// Удаляем предыдущее вхождение и добавляем в конец
			var idx = nominatedOrder.indexOf(playerId);
			if (idx !== -1) nominatedOrder.splice(idx, 1);
			nominatedOrder.push(playerId);
			
			$tr.addClass('vote-nominated');
			var $next = $cb.next();
			if (!$next.hasClass('vote-input')) {
				var $input = $('<input type="number" title="Число голосов" class="vote-input" min="0" max="20" value="0" style="width:45px; margin-left:5px;">');
				$cb.after($input);
				showInfo();
			}
		} else {
			// Удаляем из массива
			var idx = nominatedOrder.indexOf(playerId);
			if (idx !== -1) nominatedOrder.splice(idx, 1);
			
			$tr.removeClass('vote-nominated');
			var $next = $cb.next();
			if ($next.hasClass('vote-input')) $next.remove();
			showInfo();
		}
		updateLastNominated();
	});

    // Обработчик для полей ввода (делегирование для jQuery 1.5)
    $("#cover").on("input", ".vote-input", function () {
        let val = parseInt($(this).val());
        if (isNaN(val)) {
            $(this).val(0);
        } else if (val < 0) {
            $(this).val(0);
        } else if (val > 20) {
            $(this).val(20);
        }
        showInfo();
    });
});

function StartTimer(timerNum) {
    // timerNum: 1 - первый таймер, 2 - второй таймер

    // Если этот таймер уже работает - останавливаем его
    if (timerNum == 1 && $timerID1 != 0) {
        StopTimer(1);
        return;
    }
    if (timerNum == 2 && $timerID2 != 0) {
        StopTimer(2);
        return;
    }

    // Останавливаем другой таймер, если он работает
    if (timerNum == 1 && $timerID2 != 0) {
        StopTimer(2);
    }
    if (timerNum == 2 && $timerID1 != 0) {
        StopTimer(1);
    }

    // Устанавливаем начальное значение таймера
    if (timerNum == 1) {
        $waitTime1 = window.$timerSettings1 ? window.$timerSettings1.duration : $waitTimerDefault1;
        updateTimerDisplay(1);
        $timerID1 = setTimeout(function () {
            ShowTimer(1);
        }, 1000);
        // Делаем неактивным ДРУГОЙ таймер
        $("#btnTimer2").prop("disabled", true);
        // Свой таймер оставляем активным (чтобы можно было остановить)
        $("#btnTimer1").prop("disabled", false);
    } else {
        $waitTime2 = window.$timerSettings2 ? window.$timerSettings2.duration : $waitTimerDefault2;
        updateTimerDisplay(2);
        $timerID2 = setTimeout(function () {
            ShowTimer(2);
        }, 1000);
        // Делаем неактивным ДРУГОЙ таймер
        $("#btnTimer1").prop("disabled", true);
        // Свой таймер оставляем активным (чтобы можно было остановить)
        $("#btnTimer2").prop("disabled", false);
    }
}

function ShowTimer(timerNum) {
    var settings = (timerNum == 1) ? window.$timerSettings1 : window.$timerSettings2;
    if (!settings) return;
    
    if (timerNum == 1) {
        if ($waitTime1 > 0) {
            $waitTime1--;
            updateTimerDisplay(1);
            if ($waitTime1 <= 10 && $waitTime1 > 0) {
                $("#btnTimer1").css("background-color", "#ffff99");
                if ($waitTime1 === 10 && settings.enabled) {
                    // желтая вспышка
                    let yellowFlash = $('<div style="position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(255, 255, 0, 0.5); z-index:99999; pointer-events:none; transition:opacity 1s;"></div>');
                    $("body").append(yellowFlash);
                    setTimeout(function() { yellowFlash.css("opacity", "0"); setTimeout(function() { yellowFlash.remove(); }, 1000); }, 500);
                    // звук
                    try {
                        let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        let oscillator = audioCtx.createOscillator();
                        let gainNode = audioCtx.createGain();
                        oscillator.connect(gainNode);
                        gainNode.connect(audioCtx.destination);
                        oscillator.frequency.value = settings.beepFreq;
                        gainNode.gain.value = settings.beepVolume;
                        oscillator.start();
                        oscillator.stop(audioCtx.currentTime + settings.beepDuration);
                    } catch(e) {}
                }
            } else {
                $("#btnTimer1").css("background-color", "");
            }
            if ($waitTime1 > 0) {
                $timerID1 = setTimeout(function() { ShowTimer(1); }, 1000);
            } else {
                StopTimer(1);
                let flash = $('<div style="position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(255, 0, 0, 0.7); z-index:99999; pointer-events:none; transition:opacity 0.5s;"></div>');
                $("body").append(flash);
                setTimeout(function() { flash.css("opacity", "0"); setTimeout(function() { flash.remove(); }, 500); }, 100);
                if (settings.enabled) {
                    try {
                        let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        let oscillator = audioCtx.createOscillator();
                        let gainNode = audioCtx.createGain();
                        oscillator.connect(gainNode);
                        gainNode.connect(audioCtx.destination);
                        oscillator.frequency.value = settings.alarmFreq;
                        gainNode.gain.value = settings.alarmVolume;
                        oscillator.start();
                        oscillator.stop(audioCtx.currentTime + settings.alarmDuration);
                    } catch(e) {}
                }
                $("#btnTimer1").css("background-color", "#ff0000");
                setTimeout(function() { $("#btnTimer1").css("background-color", ""); }, 500);
                $("#btnTimer1").prop("disabled", false);
                $("#btnTimer2").prop("disabled", false);
            }
        } else {
            StopTimer(1);
        }
    } else { // timerNum == 2
        if ($waitTime2 > 0) {
            $waitTime2--;
            updateTimerDisplay(2);
            if ($waitTime2 <= 10 && $waitTime2 > 0) {
                $("#btnTimer2").css("background-color", "#ffff99");
                if ($waitTime2 === 10 && settings.enabled) {
                    let yellowFlash = $('<div style="position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(255, 255, 0, 0.5); z-index:99999; pointer-events:none; transition:opacity 1s;"></div>');
                    $("body").append(yellowFlash);
                    setTimeout(function() { yellowFlash.css("opacity", "0"); setTimeout(function() { yellowFlash.remove(); }, 1000); }, 500);
                    try {
                        let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        let oscillator = audioCtx.createOscillator();
                        let gainNode = audioCtx.createGain();
                        oscillator.connect(gainNode);
                        gainNode.connect(audioCtx.destination);
                        oscillator.frequency.value = settings.beepFreq;
                        gainNode.gain.value = settings.beepVolume;
                        oscillator.start();
                        oscillator.stop(audioCtx.currentTime + settings.beepDuration);
                    } catch(e) {}
                }
            } else {
                $("#btnTimer2").css("background-color", "");
            }
            if ($waitTime2 > 0) {
                $timerID2 = setTimeout(function() { ShowTimer(2); }, 1000);
            } else {
                StopTimer(2);
                let flash = $('<div style="position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(255, 0, 0, 0.7); z-index:99999; pointer-events:none; transition:opacity 0.5s;"></div>');
                $("body").append(flash);
                setTimeout(function() { flash.css("opacity", "0"); setTimeout(function() { flash.remove(); }, 500); }, 100);
                if (settings.enabled) {
                    try {
                        let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        let oscillator = audioCtx.createOscillator();
                        let gainNode = audioCtx.createGain();
                        oscillator.connect(gainNode);
                        gainNode.connect(audioCtx.destination);
                        oscillator.frequency.value = settings.alarmFreq;
                        gainNode.gain.value = settings.alarmVolume;
                        oscillator.start();
                        oscillator.stop(audioCtx.currentTime + settings.alarmDuration);
                    } catch(e) {}
                }
                $("#btnTimer2").css("background-color", "#ff0000");
                setTimeout(function() { $("#btnTimer2").css("background-color", ""); }, 500);
                $("#btnTimer1").prop("disabled", false);
                $("#btnTimer2").prop("disabled", false);
            }
        } else {
            StopTimer(2);
        }
    }
}

function updateTimerDisplay(timerNum) {
    if (timerNum == 1) {
        sec = $waitTime1 % 60;
        if (sec < 10) sec = "0" + sec;
        min = Math.floor($waitTime1 / 60);
        $("#btnTimer1").val(min + ":" + sec);
    } else {
        sec = $waitTime2 % 60;
        if (sec < 10) sec = "0" + sec;
        min = Math.floor($waitTime2 / 60);
        $("#btnTimer2").val(min + ":" + sec);
    }
}

function StopTimer(timerNum) {
    if (timerNum == 1) {
        clearTimeout($timerID1);
        var dur = window.$timerSettings1 ? window.$timerSettings1.duration : $waitTimerDefault1;
		$("#btnTimer1").val("" + dur + " сек.");
        $("#btnTimer1").css("background-color", "");
        $timerID1 = 0;
    } else {
        clearTimeout($timerID2);
        $("#btnTimer2").val("" + $waitTimerDefault2 + " сек.");
        $("#btnTimer2").css("background-color", "");
        $timerID2 = 0;
    }

    // При остановке любого таймера активируем оба
    $("#btnTimer1").prop("disabled", false);
    $("#btnTimer2").prop("disabled", false);
}

function loadCSS() {
    $("#lcss").attr("href", $cssFolder + $("#sCSS").find("option:selected").val());
}

function setClass(id, cls, sett = 1) {
    if (1 == sett) {
        $("#tr" + id).addClass(cls);
    } else {
        $("#tr" + id).removeClass(cls);
    }
}

function renum() {
    n = 1;
    $(".sDigit").each(function () {
        $(this).html(n++);
    });

    // Сохраняем таймер в заголовке при перенумерации
    let timerValue = $(".clNums").html();
    if (timerValue.indexOf("🕒") !== -1) {
        // Таймер уже есть, оставляем как есть
    } else {
        // Если таймера нет, устанавливаем начальное значение
        $(".clNums").html("🕒 00:00");
    }

    updateRowsCount();
}

// Обновление переменной $rows (общее количество игроков)
function updateRowsCount() {
    $rows = 0;
    $(".tr").each(function () {
        arr = $regRowID.exec($(this).attr("id"));
        if (arr && parseInt(arr[1]) > $rows) {
            $rows = parseInt(arr[1]);
        }
    });
}

// Подсчитываем остатки мафии (для вора)
function countMaff() {
    $maffCnt = 0;
    $sitizenCnt = 0;
    // Прогоняем столбик ролей
    // Если игра не началась, то смотрим select'ы
    if (!$inGame)
        $("#cover")
            .find("select")
            .each(function () {
                // Определяем код игрока
                arr = $regRole.exec($(this).parent().attr("id"));
                role = $(this).find("option:selected").html();
                // Подсчитываем живых мирных
                if ($arRoles[2] != role && $arRoles[3] != role) $sitizenCnt++;
                // Подсчитываем количество мафии
                // Это нужно для случая, если у нас есть роль вора
                // Если вдруг мафия одна, то запоминаем её id,
                // иначе просто запоминаем последний id
                if ($arRoles[2] == role) {
                    $idMaff = arr[1];
                    $maffCnt++;
                }
                // Дона тоже подсчитываем, но не запоминаем id
                if ($arRoles[3] == role) $maffCnt++;
            });
    // иначе смотрим span'ы
    else
        $(".clRoles").each(function () {
            if ($titleRole != $(this).html()) {
                // Определяем код игрока
                arr = $regRole.exec($(this).attr("id"));
                // Считаем мёртвых
                if ($(this).parent().hasClass($classDie)) $died++;
                // Подсчитываем живых мирных
                if (
                    $arRoles[2] != $(this).html() &&
                    $arRoles[3] != $(this).html() &&
                    !$(this).parent().hasClass($classDie)
                )
                    $sitizenCnt++;
                // Подсчитываем количество мафии
                // Это нужно для случая, если у нас есть роль вора
                // Если вдруг мафия одна, то запоминаем её id,
                // иначе просто запоминаем последний id
                if ($arRoles[2] == $(this).html() && !$(this).parent().hasClass($classDie)) {
                    $idMaff = arr[1];
                    $maffCnt++;
                }
                // Дона тоже подсчитываем, но не запоминаем id
                if ($arRoles[3] == $(this).html() && !$(this).parent().hasClass($classDie)) $maffCnt++;
            }
        });
    showInfo();
    if ($Debug) showDebugInfo();
}

// Вспомогательная функция для обработки взрыва шахида
function processShahidExplosion(shahidId, stole, isDayPhase) {
    let victims = [];
    let shahidExplodes = true;

    // Проверяем, не украл ли вор способность Шахида
    if (stole == shahidId) {
        shahidExplodes = false; // Вор украл способность - Шахид не взрывается
    }

    if (shahidExplodes) {
        // Получаем номера прямых соседей
        let leftNeighborId = getLeftNeighborId(shahidId);
        let rightNeighborId = getRightNeighborId(shahidId);

        // Проверяем левого соседа
        if (leftNeighborId && $("#tr" + leftNeighborId).length) {
            // Для ночной фазы проверяем лечение
            if (!isDayPhase) {
                if (
                    !$("#tr" + leftNeighborId).hasClass($classDie) &&
                    leftNeighborId != $cure &&
                    leftNeighborId != $bcure
                ) {
                    victims.push(leftNeighborId);
                }
            } else {
                // Для дневной фазы просто проверяем, жив ли
                if (!$("#tr" + leftNeighborId).hasClass($classDie)) {
                    victims.push(leftNeighborId);
                }
            }
        }

        // Проверяем правого соседа
        if (rightNeighborId && $("#tr" + rightNeighborId).length) {
            if (!isDayPhase) {
                if (
                    !$("#tr" + rightNeighborId).hasClass($classDie) &&
                    rightNeighborId != $cure &&
                    rightNeighborId != $bcure
                ) {
                    victims.push(rightNeighborId);
                }
            } else {
                if (!$("#tr" + rightNeighborId).hasClass($classDie)) {
                    victims.push(rightNeighborId);
                }
            }
        }
    }

    return {
        explodes: shahidExplodes,
        victims: victims,
    };
}

// Вспомогательная функция для обработки смерти игрока
function processPlayerDeath(playerId, isDayPhase) {
    // Проверяем роли погибших
    if ($idMedic == playerId) $idMedic = -Math.abs($idMedic);
    if ($idManiac == playerId) $idManiac = -Math.abs($idManiac);
    if ($idDetective == playerId) $idDetective = -Math.abs($idDetective);
    if ($idBomber == playerId) $idBomber = -Math.abs($idBomber);
    if ($idBoss == playerId) $idBoss = -Math.abs($idBoss);
    if ($idBeauty == playerId) $idBeauty = -Math.abs($idBeauty);
    if ($idThief == playerId) $idThief = -Math.abs($idThief);
    if ($idImmortal == playerId) $idImmortal = -Math.abs($idImmortal);
    if ($idShahid == playerId) $idShahid = -Math.abs($idShahid);

    setClass(playerId, $classDie);
}

window.clearVoteCheckboxes = function() {
    $('.vote-checkbox').attr('checked', false);
    $('.vote-nominated').removeClass('vote-nominated');
    $('.vote-input').remove();
    nominatedOrder = [];
    showInfo();
    updateLastNominated();
};

// Обновление подсветки последнего выдвинутого на голосование
function updateLastNominated() {
    $('.vote-checkbox').removeClass('vote-checkbox-last');
    if (nominatedOrder.length === 0) return;
    var lastId = nominatedOrder[nominatedOrder.length - 1];
    $('.vote-checkbox').each(function() {
        if ($(this).data('player') == lastId) {
            $(this).addClass('vote-checkbox-last');
        }
    });
}

// Очередной раунд
function RoundAdd(State) {
    // Останавливаем оба таймера при смене раунда
    if ($timerID1 != 0) StopTimer(1);
    if ($timerID2 != 0) StopTimer(2);

    // Проверка обязательных действий для завершения текущей фазы
    var missingActions = [];
    if ($round > 0) {
        if (State == 1) {
            // Переход к ночи — проверяем дневные действия (казнь)
            missingActions = validateDayActions();
        } else {
            // State == 2
            // Переход ко дню — проверяем ночные действия (мафия, шериф и т.д.)
            missingActions = validateNightActions();
        }
    }
    if (missingActions.length > 0) {
        var message = "Не выбраны обязательные действия:\n• " + missingActions.join("\n• ");
        message += "\n\nПродолжить без них?";
        if (!confirm(message)) {
            return; // Прерываем создание столбца
        }
    }

    if (1 == State) {
        // Сейчас ночь
        $stole = 0;
        if (0 < $round) RoundEnd(3 - State); // Завершаем день (State=2)
        $round++;

        $("#btnNight").prop("disabled", true);
        $("#btnDay").prop("disabled", false);

        // Добавляем в конец всех строк таблицы
        $(".tr").each(function () {
            // Определяем ID строки
            arr = $regRowID.exec($(this).attr("id"));
            id = arr[1];
            // Если это заголовок, то просто указываем номер ночи
            if (0 == id) {
                cls = "th clRound";
                ee = "Н" + $round;
            } else {
                cls = "td clRound";
                ee = "";
                // Если в игре есть вор, то делаем кнопку
                if (0 != $idThief) {
                    // Если сам не вор и не умер и вор ещё живой...
                    if (!$(this).hasClass($classDie) && $idThief > 0 && id != $idThief)
                        ee =
                            ee +
                            '<input type="button" id="g' +
                            id +
                            'b2" onclick="Action(' +
                            id +
                            ',2);" value="' +
                            $arBtnTitles[2] +
                            '" title="ВОР" />';
                    else ee = ee + '<input type="button" disabled value="' + $arBtnTitles[2] + '"/>';
                }
                // Если ещё не умер, то делаем кнопку для убийства
                if (!$(this).hasClass($classDie))
                    ee =
                        ee +
                        '<input type="button" id="g' +
                        id +
                        'b1" onclick="Action(' +
                        id +
                        ',1);" value="' +
                        $arBtnTitles[1] +
                        '" title="МАФИЯ" />';
                else ee = ee + '<input type="button" disabled value="' + $arBtnTitles[1] + '"/>';
                // Если у нас есть в игре доктор, то делаем кнопку с лечением
                if (0 != $idMedic) {
                    // Если сам не доктор (или себя ещё не лечил) и доктор не умер и игрок не мёртвый...
                    if (
                        ($arRoles[5] != $("#sRole" + id).html() || $SelfCure == false) &&
                        !$(this).hasClass($classDie) &&
                        $idMedic > 0
                    )
                        ee =
                            ee +
                            '<input type="button" id="g' +
                            id +
                            'b3" onclick="Action(' +
                            id +
                            ',3);" value="' +
                            $arBtnTitles[3] +
                            '" title="ДОКТОР" />';
                    else ee = ee + '<input type="button" disabled value="' + $arBtnTitles[3] + '"/>';
                }
                // Если у нас есть в игре детектив, то делаем кнопку с его действием
                if (0 != $idDetective) {
                    // Проверяем, не украл ли вор способность у Шерифа
                    let isSheriffActive = true;
                    let sheriffId = Math.abs($idDetective); // Используем Math.abs, так как $idDetective может быть отрицательным

                    // Проверяем, есть ли активный вор и украл ли он способность у Шерифа
                    if ($stole == sheriffId) {
                        isSheriffActive = false;
                    }

                    // Если сам не детектив и не умер и детектив ещё живой и его способность не украдена...
                    if (
                        $arRoles[4] != $("#sRole" + id).html() &&
                        !$(this).hasClass($classDie) &&
                        $idDetective > 0 &&
                        isSheriffActive
                    )
                        ee =
                            ee +
                            '<input type="button" id="g' +
                            id +
                            'b4" onclick="Action(' +
                            id +
                            ',4);" value="' +
                            $arBtnTitles[4] +
                            '" title="ШЕРИФ" />';
                    else ee = ee + '<input type="button" disabled value="' + $arBtnTitles[4] + '"/>';
                }
                // Если у нас есть в игре красотка, то делаем кнопку с его действием
                if (0 != $idBeauty) {
                    // Если сам не красотка и не умер и красотка ещё жива...
                    if ($arRoles[6] != $("#sRole" + id).html() && !$(this).hasClass($classDie) && $idBeauty > 0)
                        ee =
                            ee +
                            '<input type="button" id="g' +
                            id +
                            'b5" onclick="Action(' +
                            id +
                            ',5);" value="' +
                            $arBtnTitles[5] +
                            '" title="КРАСОТКА" />';
                    else ee = ee + '<input type="button" disabled value="' + $arBtnTitles[5] + '"/>';
                }
                // Если у нас есть в игре маньяк, то делаем кнопку с его действием
                if (0 != $idManiac) {
                    // Если сам не маньяк и не умер и маньяк ещё живой...
                    if ($arRoles[7] != $("#sRole" + id).html() && !$(this).hasClass($classDie) && $idManiac > 0)
                        ee =
                            ee +
                            '<input type="button" id="g' +
                            id +
                            'b6" onclick="Action(' +
                            id +
                            ',6);" value="' +
                            $arBtnTitles[6] +
                            '" title="МАНЬЯК" />';
                    else ee = ee + '<input type="button" disabled value="' + $arBtnTitles[6] + '"/>';
                }
                // Если используем фолы (днем)
                if ($useFoulsDay)
                    if (!$(this).hasClass($classDie))
                        // Если игрок не умер, то кнопка фола активна
                        ee =
                            ee +
                            '<input type="button" id="g' +
                            id +
                            'b9" onclick="Action(' +
                            id +
                            ',9);" value="' +
                            $arBtnTitles[9] +
                            '" />';
                    else ee = ee + '<input type="button" disabled value="' + $arBtnTitles[9] + '"/>';
            }
            $(this).append(
                '<div class="' + cls + '" id="actg' + id + "st" + State + "r" + $round + '">' + ee + "</span>"
            );
        });

        // Показываем модальное окно только в первом раунде
        if ($round === 1) {
            // Создаем кастомное модальное окно для ввода номеров игроков с иммунитетом
            var modal = $(
                '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:20px;border:2px solid #4CAF50;border-radius:10px;z-index:10000;box-shadow:0 0 20px rgba(0,0,0,0.3);min-width:300px;">' +
                    '<h3 style="margin-top:0;color:#4CAF50;text-align:center;">Иммунитет</h3>' +
                    '<p style="margin-bottom:15px;">Номер <strong>первого</strong> игрока с иммунитетом:</p>' +
                    '<input type="number" id="immunityPlayer1" min="1" max="' +
                    $rows +
                    '" style="width:100%;padding:8px;margin-bottom:20px;border:1px solid #ccc;border-radius:5px;box-sizing:border-box;">' +
                    '<p style="margin-bottom:15px;">Номер <strong>второго</strong> игрока с иммунитетом (оставьте пустым, если не нужен):</p>' +
                    '<input type="number" id="immunityPlayer2" min="1" max="' +
                    $rows +
                    '" style="width:100%;padding:8px;margin-bottom:20px;border:1px solid #ccc;border-radius:5px;box-sizing:border-box;">' +
                    '<div style="display:flex;gap:10px;justify-content:center;">' +
                    '<button id="cancelBtn" style="background:#ccc;border:none;padding:8px 20px;border-radius:5px;cursor:pointer;">Отмена</button>' +
                    '<button id="confirmBtn" style="background:#4CAF50;color:white;border:none;padding:8px 20px;border-radius:5px;cursor:pointer;">OK</button>' +
                    "</div>" +
                    "</div>"
            );

            // Затемнение фона
            var overlay = $(
                '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;"></div>'
            );

            $("body").append(overlay).append(modal);

            // Фокусируемся на поле ввода
            $("#immunityPlayer1").focus();

            // Функция обработки подтверждения
            function handleImmunityConfirmation() {
                var player1 = $("#immunityPlayer1").val();
                var player2 = $("#immunityPlayer2").val();

                // Обрабатываем первого игрока
                if (player1 && player1 >= 1 && player1 <= $rows) {
                    applyImmunityToPlayer(parseInt(player1));
                }

                // Обрабатываем второго игрока (если указан)
                if (player2 && player2 >= 1 && player2 <= $rows) {
                    applyImmunityToPlayer(parseInt(player2));
                }

                modal.remove();
                overlay.remove();
            }

            // Функция применения иммунитета к игроку
            function applyImmunityToPlayer(playerNum) {
                $(".clRound").each(function () {
                    var idMatch = $(this)
                        .attr("id")
                        .match(/actg(\d+)st1r(\d+)/);
                    if (idMatch && parseInt(idMatch[1]) === playerNum) {
                        // Делаем все кнопки неактивными, КРОМЕ кнопки фола (b9)
                        $(this)
                            .find("input[type='button']")
                            .each(function () {
                                var btnId = $(this).attr("id");
                                // Если это не кнопка фола (b9), делаем disabled
                                if (btnId && btnId.match(/b9$/) === null) {
                                    $(this).prop("disabled", true);
                                }
                                // Кнопку фола оставляем активной
                            });
                    }
                });
            }

            // Обработчики событий
            $("#cancelBtn").click(function () {
                modal.remove();
                overlay.remove();
            });

            $("#confirmBtn").click(handleImmunityConfirmation);

            // Обработка нажатия Enter в полях ввода
            $("#immunityPlayer1, #immunityPlayer2").keypress(function (e) {
                if (e.which === 13) {
                    // Код клавиши Enter
                    handleImmunityConfirmation();
                    return false;
                }
            });

            // Закрытие при клике вне модального окна
            overlay.click(function () {
                modal.remove();
                overlay.remove();
            });

            // Закрытие при нажатии Esc
            $(document).one("keyup", function (e) {
                if (e.keyCode === 27) {
                    // Esc
                    modal.remove();
                    overlay.remove();
                }
            });
        }
        clearVoteCheckboxes();
    } else {
        // Сейчас день
        RoundEnd(3 - State); // 3-2=1 - нам надо закончить ночь прежде, чем начинать день
        $("#btnNight").prop("disabled", false);
        $("#btnDay").prop("disabled", true);
		clearVoteCheckboxes();

        // Добавляем в конец всех строк таблицы
        $(".tr").each(function () {
            // Определяем ID строки
            arr = $regRowID.exec($(this).attr("id"));
            id = arr[1];
            // Если это заголовок, то просто указываем номер ночи
            if (0 == id) {
                cls = "th clRound";
                ee = "Д" + $round;
            } else {
                cls = "td clRound";
                ee = "";
                // Определяем код игрока
                arr = $regRowID.exec($(this).attr("id"));
                // Если игрок в игре, то выводим кнопку казни
                if (!$(this).hasClass($classDie))
                    ee =
                        ee +
                        '<input type="button" id="g' +
                        id +
                        'b7" onclick="Action(' +
                        id +
                        ',7);" value="' +
                        $arBtnTitles[7] +
                        '" />';
                else ee = ee + '<input type="button" disabled value="' + $arBtnTitles[7] + '"/>';
                // Если у нас есть в игре террорист, то делаем кнопку с его действием
                if (0 != $idBomber) {
                    // Если сам не террорист и не умер и террорист ещё живой...
                    if ($arRoles[10] != $("#sRole" + id).html() && !$(this).hasClass($classDie) && $idBomber > 0)
                        ee =
                            ee +
                            '<input type="button" id="g' +
                            id +
                            'b8" onclick="Action(' +
                            id +
                            ',8);" value="' +
                            $arBtnTitles[8] +
                            '" title="СМЕРТНИК" />';
                    else ee = ee + '<input type="button" disabled value="' + $arBtnTitles[8] + '" title="СМЕРТНИК" />';
                }

                // Если используем фолы (в дневном раунде — $useFoulsNight)
                if ($useFoulsNight) {
                    if (!$(this).hasClass($classDie)) {
                        ee =
                            ee +
                            '<input type="button" id="g' +
                            id +
                            'b9" onclick="Action(' +
                            id +
                            ',9);" value="' +
                            $arBtnTitles[9] +
                            '" title="ФОЛ" />';
                    } else {
                        ee = ee + '<input type="button" disabled value="' + $arBtnTitles[9] + '"/>';
                    }
                }

                // Добавляем чекбокс для отметки выдвинутых на голосование (только для живых)
                if (!$(this).hasClass($classDie)) {
                    ee =
                        ee +
                        '<input type="checkbox" title="Выдвинут на голосование" class="vote-checkbox" data-player="' +
                        id +
                        '" style="margin-left:5px; vertical-align:middle;">';
                }
            }
            $(this).append(
                '<div class="' + cls + '" id="actg' + id + "st" + State + "r" + $round + '">' + ee + "</span>"
            );
        });
    }
}

// Проверка, что все обязательные ночные действия выбраны
function validateNightActions() {
    let missing = [];

    // Мафия (b1) – должна быть выбрана ровно одна цель, если есть живые мафиози
    if ($maffCnt > 0) {
        let mafiaSelected = $(".clRound").find('input[id$="b1"].' + $classBtnSelected).length;
        if (mafiaSelected === 0) missing.push($arBtnTitles[1] + " (Мафия)");
    }

    // Вор (b2) – если жив
    if ($idThief > 0 && !$("#tr" + $idThief).hasClass($classDie)) {
        let thiefSelected = $(".clRound").find('input[id$="b2"].' + $classBtnSelected).length;
        if (thiefSelected === 0) missing.push($arBtnTitles[2] + " (Вор)");
    }

    // Доктор (b3)
    if ($idMedic > 0 && !$("#tr" + $idMedic).hasClass($classDie)) {
        let doctorSelected = $(".clRound").find('input[id$="b3"].' + $classBtnSelected).length;
        if (doctorSelected === 0) missing.push($arBtnTitles[3] + " (Доктор)");
    }

    // Шериф (b4)
    if ($idDetective > 0 && !$("#tr" + $idDetective).hasClass($classDie)) {
        let sheriffSelected = $(".clRound").find('input[id$="b4"].' + $classBtnSelected).length;
        if (sheriffSelected === 0) missing.push($arBtnTitles[4] + " (Шериф)");
    }

    // Красотка (b5)
    if ($idBeauty > 0 && !$("#tr" + $idBeauty).hasClass($classDie)) {
        let beautySelected = $(".clRound").find('input[id$="b5"].' + $classBtnSelected).length;
        if (beautySelected === 0) missing.push($arBtnTitles[5] + " (Красотка)");
    }

    // Маньяк (b6)
    if ($idManiac > 0 && !$("#tr" + $idManiac).hasClass($classDie)) {
        let maniacSelected = $(".clRound").find('input[id$="b6"].' + $classBtnSelected).length;
        if (maniacSelected === 0) missing.push($arBtnTitles[6] + " (Маньяк)");
    }

    return missing;
}

// Проверка дневных обязательных действий
function validateDayActions() {
    let missing = [];

    // Казнь (b7) – должна быть выбрана ровно одна цель
    let executionSelected = $(".clRound").find('input[id$="b7"].' + $classBtnSelected).length;
    if (executionSelected === 0) missing.push($arBtnTitles[7] + " (Казнь)");

    // Смертник (b8) – опционально, не проверяем

    return missing;
}

// Завершение очередного раунда, применение всех кнопок
function RoundEnd(State) {
    if (1 == State) {
        // Резюмируем ночные действия
        $die = $dieM = $bdie = $bdieM = $cure = $bcure = $stole = $foul = 0;
        // Добавить инициализацию для маньяка
        if ($maniacKills) {
            $bdieM = 0;
        }

        // СОХРАНЯЕМ ДЕЙСТВИЯ ДЛЯ КАЖДОГО ИГРОКА ПЕРЕД ИХ ОБРАБОТКОЙ
        let playerActions = {};

        // Проходим по всем строкам таблицы
        $(".tr").each(function () {
            // Определяем ID строки (игрока)
            arr = $regRowID.exec($(this).attr("id"));
            if (0 != arr[1]) {
                let playerId = arr[1];
                let actionsStr = "";

                // Теперь проверяем все кнопки, которые есть у игрока
                $(this)
                    .find(":button")
                    .each(function () {
                        // Если кнопка отмечена, как нажатая, то обрабатываем
                        if ($(this).hasClass($classBtnSelected)) {
                            let btnValue = $(this).val();

                            // Если убит, запоминаем это
                            if ($arBtnTitles[1] == btnValue) $die = playerId;
                            if ($arBtnTitles[6] == btnValue) $dieM = playerId;
                            // Если игрок был вылечен, запоминаем это
                            if ($arBtnTitles[3] == btnValue) $cure = playerId;
                            // Если этот игрок был спасён красоткой, запоминаем это
                            if ($arBtnTitles[5] == btnValue) $bcure = playerId;
                            // Если вор украл у игрока функцию, запоминаем это
                            if ($arBtnTitles[2] == btnValue) $stole = playerId;
                            // Если игрок получил замечание, запоминаем это
                            if ($arBtnTitles[9] == btnValue) {
                                $foul = playerId;
                            }

                            // Накапливаем значения кнопок для отображения (кроме фолов)
                            if ($arBtnTitles[9] != btnValue) actionsStr = actionsStr + btnValue;
                        }
                    });

                // СОХРАНЯЕМ действия в объект
                playerActions[playerId] = actionsStr;
            }
        });

        // Предварительная проверка - вор украл способность
        if (0 != $stole) {
            if ($stole == $idMedic) $cure = 0;
            if ($stole == $idBeauty) $bcure = 0;
            // Если вор украл способность у Шерифа
            if ($stole == $idDetective) {
                // Деактивируем кнопки Шерифа
                toggleSheriffButtons($stole, $stole, true);
            }
            // Если вор украл способность босса или остался только один мафиози и вор украл его способность, то никто никого не убил
            if ($stole == $idBoss || (0 <= $idBoss && 1 == $maffCnt && $stole == $idMaff)) $die = 0;
            if ($maniacKills) {
                if ($stole == $idManiac) $dieM = 0;
            }
        }
        // Первая проверка - кого-то убили и вылечили
        if ($die == $cure || $die == $bcure) $die = 0;
        if ($maniacKills) {
            if ($dieM == $cure || $dieM == $bcure) $dieM = 0;
        }
        // Если вор украл способность бессмертного и бессмертного убили, то бессмертный умрёт
        if ($idImmortal == $die && $stole != $idImmortal) $die = 0;
        // Если вор украл способность бессмертного и вора убили, то вор не умрёт
        if ($idThief == $die && $stole == $idImmortal) $die = 0;

        // Проверяем, не себя ли лечил доктор, если да, то помечаем
        if ($idMedic == $cure) $SelfCure = true;

        // Вторая проверка - если всё-таки не вылечили
        if (0 != $die) {
            // Проверяем, был ли убитый Шахидом
            let shahidVictims = [];
            let shahidActions = playerActions[$die] || ""; // Берем сохраненные действия
            let shahidResult = { explodes: true, victims: [] };

            // Если Шахид должен взорваться, проверяем прямых соседей
            if ($idShahid == $die) {
                shahidResult = processShahidExplosion($die, $stole, false);
                shahidVictims = shahidResult.victims;
            }

            // Если убили красотку, то умирают двое
            if ($idBeauty == $die) {
                // Погибает тот, кого она спасала, если его не лечили
                if ($cure != $bcure) $bdie = $bcure;
                $idBeauty = -Math.abs($idBeauty); // Запоминаем, что красотки больше нет
            }

            // ЗАПИСЫВАЕМ действия для Шахида с учетом взрыва
            if ($idShahid == $die) {
                if (shahidResult.explodes) {
                    // Взрывается - показываем все действия + 💥
                    if (shahidActions != "") {
                        playerActions[$die] = shahidActions + "💥";
                    } else {
                        playerActions[$die] = "💥";
                    }
                } else {
                    // Не взрывается (вор украл) - показываем только действия
                }
            }

            // Отмечаем погибших от взрыва шахида (только если он взорвался)
            shahidVictims.forEach(function (victimId) {
                // СОХРАНЯЕМ ВСЕ ДЕЙСТВИЯ, КОТОРЫЕ БЫЛИ НАПРАВЛЕНЫ НА ЖЕРТВУ
                let victimActions = playerActions[victimId] || "";
                // Если на жертву было направлено действие, добавляем его перед молнией
                if (victimActions != "") {
                    playerActions[victimId] = victimActions + "⚡";
                } else {
                    playerActions[victimId] = "⚡";
                }
                processPlayerDeath(victimId, false);
            });

            // Если был убит обычный игрок (не шахид), оставляем старую логику
            if ($idShahid != $die) {
                // Проверяем роли погибших
                if ($idMedic == $die) $idMedic = -Math.abs($idMedic);
                if ($idManiac == $die) $idManiac = -Math.abs($idManiac);
                if ($idDetective == $die) $idDetective = -Math.abs($idDetective);
                if ($idBomber == $die) $idBomber = -Math.abs($idBomber);
                if ($idBoss == $die) $idBoss = -Math.abs($idBoss);
                if ($idShahid == $die) $idShahid = -Math.abs($idShahid);

                // Если после всех проверок кто-то всё-таки умер, то отмечаем это
                if (0 != $die) setClass($die, $classDie);
                if (0 != $bdie) setClass($bdie, $classDie);
            }
        }

        // Вторая проверка для убивающего маньяка - если всё-таки не вылечили
        if ($maniacKills) {
            if (0 != $dieM) {
                // Проверяем, был ли убитый Шахидом
                let shahidVictimsM = [];
                let shahidActionsM = playerActions[$dieM] || ""; // Берем сохраненные действия
                let shahidResultM = { explodes: true, victims: [] };

                // Если Шахид должен взорваться, проверяем прямых соседей
                if ($idShahid == $dieM) {
                    shahidResultM = processShahidExplosion($dieM, $stole, false);
                    shahidVictimsM = shahidResultM.victims;
                }

                // Если убили красотку, то умирают двое
                if ($idBeauty == $dieM) {
                    if ($cure != $bcure) $bdieM = $bcure;
                    $idBeauty = -Math.abs($idBeauty);
                }

                // ЗАПИСЫВАЕМ действия для Шахида с учетом взрыва
                if ($idShahid == $dieM) {
                    if (shahidResultM.explodes) {
                        // Взрывается
                        if (shahidActionsM != "") {
                            playerActions[$dieM] = shahidActionsM + "💥";
                        } else {
                            playerActions[$dieM] = "💥";
                        }
                    } else {
                        // Не взрывается (вор украл)
                    }
                }

                // Отмечаем погибших от взрыва (только если он взорвался)
                shahidVictimsM.forEach(function (victimId) {
                    // СОХРАНЯЕМ ВСЕ ДЕЙСТВИЯ, КОТОРЫЕ БЫЛИ НАПРАВЛЕНЫ НА ЖЕРТВУ
                    let victimActions = playerActions[victimId] || "";
                    if (victimActions != "") {
                        playerActions[victimId] = victimActions + "⚡";
                    } else {
                        playerActions[victimId] = "⚡";
                    }
                    processPlayerDeath(victimId, false);
                });

                // Если был убит обычный игрок (не шахид), оставляем старую логику
                if ($idShahid != $dieM) {
                    // Проверяем роли
                    if ($idMedic == $dieM) $idMedic = -Math.abs($idMedic);
                    if ($idManiac == $dieM) $idManiac = -Math.abs($idManiac);
                    if ($idDetective == $dieM) $idDetective = -Math.abs($idDetective);
                    if ($idBomber == $dieM) $idBomber = -Math.abs($idBomber);
                    if ($idBoss == $dieM) $idBoss = -Math.abs($idBoss);

                    if (0 != $dieM) setClass($dieM, $classDie);
                    if (0 != $bdieM) setClass($bdieM, $classDie);
                }
            }
        }

        // ТЕПЕРЬ ЗАПИСЫВАЕМ ВСЕ ДЕЙСТВИЯ В ЯЧЕЙКИ
        for (let playerId in playerActions) {
            $("#actg" + playerId + "st" + State + "r" + $round).html(playerActions[playerId]);
        }

        // Если после всех проверок кто-то всё-таки умер, то отмечаем это
        if (0 != $die) setClass($die, $classDie);
        if (0 != $bdie) setClass($bdie, $classDie);
        if ($maniacKills) {
            if (0 != $dieM) setClass($dieM, $classDie);
            if (0 != $bdieM) setClass($bdieM, $classDie);
        }
    } // Закрываем if (1==State)
    else {
        // Резюмируем дневные действия (State == 2)
        $die = $boom = $foul = 0;

        // СОХРАНЯЕМ ДЕЙСТВИЯ ДЛЯ КАЖДОГО ИГРОКА ПЕРЕД ИХ ОБРАБОТКОЙ
        let playerActions = {};

        $(".tr").each(function () {
            // Определяем ID строки (игрока)
            arr = $regRowID.exec($(this).attr("id"));
            if (0 != arr[1]) {
                let playerId = arr[1];
                let actionsStr = "";

                // Теперь проверяем все кнопки, которые есть у игрока
                $(this)
                    .find(":button")
                    .each(function () {
                        // Если кнопка отмечена, как нажатая, то обрабатываем
                        if ($(this).hasClass($classBtnSelected)) {
                            let btnValue = $(this).val();

                            // Если казнён, запоминаем это
                            if ($arBtnTitles[7] == btnValue) $die = playerId;
                            // Если взорван, запоминаем это
                            if ($arBtnTitles[8] == btnValue) $boom = playerId;
                            // Если игрок получил замечание, запоминаем это
                            if ($arBtnTitles[9] == btnValue) {
                                $foul = playerId;
                            }

                            // Накапливаем значения кнопок для отображения (кроме фолов)
                            if ($arBtnTitles[9] != btnValue) actionsStr = actionsStr + btnValue;
                        }
                    });

                // СОХРАНЯЕМ действия в объект
                playerActions[playerId] = actionsStr;
            }
        });

        // Если террорист взорвал кого-то, то голосование не имеет смысла
        // Поэтому помечаем "жертву" убитым, а самого террориста - взорвавшимся
        if (0 != $boom) {
            $die = $boom; // жертва взрыва
            $boom = $idBomber; // сам смертник

            // Помечаем смертника мёртвым
            processPlayerDeath($idBomber, true);
            updateCountersAfterDeath($idBomber);
            $("#tr" + $idBomber)
                .find('input[type="button"]')
                .prop("disabled", true);

            // Рисуем смертнику значок взрыва
            playerActions[$boom] = $arBtnTitles[8];
        }

        if (0 != $die) {
            // Проверяем, был ли погибший шахидом
            let shahidId = 0;
            let shahidVictims = [];
            let shahidActions = playerActions[$die] || "";
            let shahidResult = { explodes: true, victims: [] };

            if ($idShahid == $die) {
                shahidId = $die;
                // Обрабатываем взрыв шахида
                shahidResult = processShahidExplosion(shahidId, $stole, true);
                shahidVictims = shahidResult.victims;
            }

            // Отмечаем самого Шахида как убитого
            if ($idShahid == $die) {
                if (shahidResult.explodes) {
                    // Взрывается - показываем действие казни + 💥
                    if (shahidActions != "") {
                        playerActions[$die] = shahidActions + "💥";
                    } else {
                        playerActions[$die] = "💥";
                    }
                } else {
                    // Не взрывается (вор украл) - показываем только действие казни
                }
                // Отмечаем Шахида мёртвым
                processPlayerDeath($die, true);
            } else {
                // Обычный игрок - просто умирает
                processPlayerDeath($die, true);
            }

            // Отмечаем погибших от взрыва шахида (только если он взорвался)
            shahidVictims.forEach(function (victimId) {
                // СОХРАНЯЕМ ВСЕ ДЕЙСТВИЯ, КОТОРЫЕ БЫЛИ НАПРАВЛЕНЫ НА ЖЕРТВУ
                let victimActions = playerActions[victimId] || "";
                if (victimActions != "") {
                    playerActions[victimId] = victimActions + "⚡";
                } else {
                    playerActions[victimId] = "⚡";
                }
                processPlayerDeath(victimId, true);
            });
        }

        // ТЕПЕРЬ ЗАПИСЫВАЕМ ВСЕ ДЕЙСТВИЯ В ЯЧЕЙКИ
        for (let playerId in playerActions) {
            $("#actg" + playerId + "st" + State + "r" + $round).html(playerActions[playerId]);
        }
    } // Закрываем else (дневные действия)
    // Подсчитываем остатки мафии (для вора)
    countMaff();
}

// Действия в игровом раунде
function Action(id, n) {
    if (0 == n) {
        // Убираем все действия, кроме фолов
        $(".dRounds")
            .find(":button")
            .each(function () {
                if ("" != $(this).attr("id")) {
                    arr = $regID.exec($(this).attr("id"));
                    if (9 != arr[2]) $(this).removeClass($classBtnSelected);
                }
            });
    } else {
        // Если это не фол, то действуем, как обычно (только одно действие за раунд)
        if (9 != n) {
            if ($("#g" + id + "b" + n).hasClass($classBtnSelected)) {
                // Кнопка уже была выделена - снимаем выделение
                $("#g" + id + "b" + n).removeClass($classBtnSelected);

                // ЕСЛИ ЭТО КНОПКА ВОРА (n=2) И МЫ СНИМАЕМ ВЫДЕЛЕНИЕ
                if (n == 2) {
                    // Получаем роль игрока, на которого была нацелена кнопка
                    let targetRole = $("#sRole" + id).html();
                    // Проверяем, является ли цель Шерифом
                    if (targetRole == $arRoles[4]) {
                        // $arRoles[4] - это роль Шерифа
                        // Возвращаем кнопки Шерифа в активное состояние
                        toggleSheriffButtons(id, id, false);
                    }
                }
            } else {
                // Сначала снимаем выделение с других кнопок того же действия
                for ($i = 1; $i <= $rows; $i++) {
                    if ($i != id) $("#g" + $i + "b" + n).removeClass($classBtnSelected);
                }
                // Затем выделяем текущую
                $("#g" + id + "b" + n).addClass($classBtnSelected);

                // ЕСЛИ ЭТО КНОПКА ВОРА (n=2) - проверяем, не украл ли вор у Шерифа
                if (n == 2) {
                    // Получаем роль игрока, на которого нажали (id - это цель вора)
                    let targetRole = $("#sRole" + id).html();
                    // Проверяем, является ли цель Шерифом
                    if (targetRole == $arRoles[4]) {
                        // $arRoles[4] - это роль Шерифа
                        // Деактивируем кнопки Шерифа
                        toggleSheriffButtons(id, id, true);
                    }
                }
            }
        }

        // Обработка фола - С ПОДТВЕРЖДЕНИЕМ, ЕСЛИ У ИГРОКА УЖЕ ЕСТЬ ФОЛЫ
        else {
            // Получаем текущее содержимое ячейки фолов
            let currentFouls = $("#foul" + id).html() || "";
            let foulCount = currentFouls.split($arBtnTitles[9]).length - 1;

            // Функция для добавления фола
            function addFoul() {
                // Добавляем символ фола
                $("#foul" + id).html(currentFouls + $arBtnTitles[9]);
                $("#g" + id + "b" + n).addClass($classBtnSelected);
                foulCount++;

                // Проверяем смерть от фолов
                if (foulCount >= $maxFoul) {
                    // Игрок умирает от фолов
                    setClass(id, $classDie, 1);

                    // НЕМЕДЛЕННО ОБНОВЛЯЕМ СЧЁТЧИКИ
                    // Обновляем переменные $sitizenCnt и $maffCnt
                    updateCountersAfterDeath(id);

                    // Обновляем отображение информации
                    showInfo();

                    // Если игра в процессе, обновляем кнопки в текущем раунде
                    if ($inGame) {
                        // Деактивируем все кнопки для умершего игрока в текущих раундах
                        $(".tr").each(function () {
                            let playerId = $(this).attr("id").replace("tr", "");
                            if (playerId == id) {
                                $(this)
                                    .find(":button")
                                    .each(function () {
                                        $(this).prop("disabled", true);
                                    });
                            }
                        });
                    }

                    if ($Debug) $("#dDebug").html("Игрок " + id + " умер от фолов!");
                }

                if ($Debug) $("#dDebug").html("Фолов у игрока " + id + ": " + foulCount);
            }

            // Если у игрока нет фолов - добавляем без подтверждения
            if (foulCount === 0) {
                addFoul();
            }
            // Если у игрока уже есть фолы - запрашиваем подтверждение
            else {
                // Создаем кастомное модальное окно
                let modal = $(
                    '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:20px;border:2px solid #cc0000;border-radius:10px;z-index:10000;box-shadow:0 0 20px rgba(0,0,0,0.5);text-align:center;">' +
                        '<h3 style="margin-top:0;color:#cc0000;">⚠️ Подтверждение фола</h3>' +
                        "<p>Игрок: <strong>" +
                        $("#sName" + id + " .left").text() +
                        " (№" +
                        id +
                        ")</strong></p>" +
                        "<p>У игрока уже есть <strong>" +
                        foulCount +
                        " " +
                        (foulCount === 1 ? "фол" : foulCount >= 2 && foulCount <= 4 ? "фола" : "фолов") +
                        "</strong></p>" +
                        "<p>Вы уверены, что хотите добавить еще один?</p>" +
                        '<div style="margin-top:20px;">' +
                        '<button id="confirmFoulBtn" style="background:#cc0000;color:white;border:none;padding:8px 20px;border-radius:5px;margin-right:10px;margin-bottom:10px;cursor:pointer;">Да, добавить</button>' +
                        '<button id="cancelFoulBtn" style="background:#ccc;border:none;padding:8px 20px;border-radius:5px;cursor:pointer;">Отмена</button>' +
                        "</div>" +
                        "</div>"
                );

                // Затемнение фона
                let overlay = $(
                    '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;"></div>'
                );

                $("body").append(overlay).append(modal);

                // Обработчики кнопок
                $("#confirmFoulBtn").click(function () {
                    addFoul();
                    modal.remove();
                    overlay.remove();
                });

                $("#cancelFoulBtn").click(function () {
                    modal.remove();
                    overlay.remove();
                });

                // Закрытие по клику вне модального окна
                overlay.click(function () {
                    modal.remove();
                    overlay.remove();
                });

                // Закрытие по Escape
                $(document).keyup(function (e) {
                    if (e.keyCode === 27) {
                        // Esc
                        modal.remove();
                        overlay.remove();
                    }
                });
            }
        }
    }
}

// Функция для обновления фолов и проверки смерти
function updateFoulsAndDeath(id) {
    // Собираем все выделенные кнопки фолов у данного игрока в текущем раунде
    let foulCount = 0;

    // Проходим по всем div'ам раундов (ночного и дневного) для данного игрока
    $('[id^="actg' + id + 'st"]').each(function () {
        $(this)
            .find(":button")
            .each(function () {
                // Если это кнопка фола (value совпадает с $arBtnTitles[9]) и она выделена
                if ($(this).val() === $arBtnTitles[9] && $(this).hasClass($classBtnSelected)) {
                    foulCount++;
                }
            });
    });

    // Также проверяем уже существующие фолы в строке игрока
    let existingFouls =
        $("#foul" + id)
            .text()
            .split($arBtnTitles[9]).length - 1;
    let totalFouls = existingFouls + foulCount;

    // Обновляем отображение в debug, если нужно
    if ($Debug) $("#dDebug").html("Фолов у игрока " + id + ": " + totalFouls);

    // Если набралось максимальное количество фолов или больше, игрок умирает
    if (totalFouls >= $maxFoul) {
        setClass(id, $classDie, 1); // Добавляем класс смерти
    } else {
        setClass(id, $classDie, 0); // Убираем класс смерти, если фолов меньше
    }
}

// Функция для управления активностью кнопок Шерифа
function toggleSheriffButtons(thiefId, sheriffId, shouldDeactivate) {
    // Если вор украл способность у Шерифа или возвращает её
    if (sheriffId > 0) {
        // Находим все кнопки проверки Шерифа в текущем раунде
        $(".tr").each(function () {
            let playerId = $(this).attr("id").replace("tr", "");
            if (playerId > 0) {
                // Ищем кнопки проверки (b4) для этого игрока
                let checkButton = $("#g" + playerId + "b4");
                if (checkButton.length) {
                    if (shouldDeactivate) {
                        // Делаем кнопку неактивной
                        checkButton.prop("disabled", true);
                        // Убираем выделение, если было
                        checkButton.removeClass($classBtnSelected);
                    } else {
                        // Возвращаем кнопку в активное состояние
                        checkButton.prop("disabled", false);
                    }
                }
            }
        });

        if ($Debug) {
            if (shouldDeactivate) {
                $("#dDebug").append("<br>Способность Шерифа украдена, кнопки проверки деактивированы");
            } else {
                $("#dDebug").append("<br>Способность Шерифа возвращена, кнопки проверки активированы");
            }
        }
    }
}

//Поднимаем игрока в списке
function GamerUp(n) {
    // Если перед данным элементом не заголовок, то можно сдвинуть вверх
    if (
        "tr0" !=
        $("#tr" + n)
            .prev()
            .attr("id")
    )
        $("#tr" + n)
            .prev()
            .before($("#tr" + n));
    renum();
    updateRowsCount();
}
//Опускаем игрока в списке
function GamerDown(n) {
    // Если за данным элементом идёт ещё один c ID, то можно сдвинуть вниз
    if (
        undefined !=
        $("#tr" + n)
            .next()
            .attr("id")
    )
        $("#tr" + n)
            .next()
            .after($("#tr" + n));
    renum();
    updateRowsCount();
}
// Удаляем игрока
function GamerDel(n) {
    $("#tr" + n).remove();
    $gamers--;
    renum();
    $sitizenCnt = $gamers;
    showInfo();
    updateRowsCount();
}

// Функция подсчёта суммы голосов (должна быть определена до showInfo)
function calculateTotalVotes() {
    let total = 0;
    $(".vote-input").each(function () {
        let val = parseInt($(this).val());
        if (!isNaN(val)) {
            total += val;
        }
    });
    return total;
}

// Показываем инфо и блокируем кнопки, ежели чо
function showInfo() {
    let totalPlayers = $sitizenCnt + $maffCnt;
    let totalVotes = calculateTotalVotes();

    info = "Всего игроков: <strong>" + totalPlayers + "</strong>";
    if (totalVotes > 0) {
        // Добавляем span с подсказкой, явно указываем inline
        info +=
            ' <span title="Всего голосов" style="cursor:help; border-bottom:1px dotted #999; display:inline; white-space:nowrap;">(' +
            totalVotes +
            ")</span>";
    }
    info +=
        '&nbsp;<br><span style="white-space: nowrap; display:inline;">Мирных: ' +
        $sitizenCnt +
        " ; Мафии: " +
        $maffCnt +
        "</span>";

    // Минимальное количество игроков набрано, можно играть (если уже не в игре)
    if ($minGamers <= $gamers && !$inGame) {
        $("#btnBegin").prop("disabled", false);
        $("#btnSpreadRoles").prop("disabled", false);
    } else {
        $("#btnBegin").prop("disabled", true);
        $("#btnSpreadRoles").prop("disabled", true);
    }
    $("#dInfo").html(info);
}

// Получение левого соседа по номеру (независимо от того, жив он или мертв)
function getLeftNeighborId(id) {
    let maxId = 0;
    $(".tr").each(function () {
        arr = $regRowID.exec($(this).attr("id"));
        if (arr && parseInt(arr[1]) > maxId) {
            maxId = parseInt(arr[1]);
        }
    });

    if (maxId === 0) return null;

    let leftId = parseInt(id) - 1;

    // Если левый сосед существует (не меньше 1)
    if (leftId >= 1) {
        return leftId;
    }

    // Зацикливаем: если левый сосед < 1, то это последний игрок
    return maxId;
}

// Получение правого соседа по номеру (независимо от того, жив он или мертв)
function getRightNeighborId(id) {
    let maxId = 0;
    $(".tr").each(function () {
        arr = $regRowID.exec($(this).attr("id"));
        if (arr && parseInt(arr[1]) > maxId) {
            maxId = parseInt(arr[1]);
        }
    });

    if (maxId === 0) return null;

    let rightId = parseInt(id) + 1;

    // Если правый сосед существует (не больше максимального)
    if (rightId <= maxId) {
        return rightId;
    }

    // Зацикливаем: если правый сосед > maxId, то это первый игрок
    return 1;
}

// Вывод данных для дебага
function showDebugInfo() {
    $("#dDebug").html(
        "Босс=" +
            $idBoss +
            $br +
            "Доктор=" +
            $idMedic +
            $br +
            "Комиссар=" +
            $idDetective +
            $br +
            "Маньяк=" +
            $idManiac +
            $br +
            "Бессмертный=" +
            $idImmortal +
            $br +
            "Красотка=" +
            $idBeauty +
            $br +
            "Вор=" +
            $idThief +
            $br +
            "Смертник=" +
            $idBomber +
            $br +
            "Шахид=" +
            $idShahid +
            $br +
            $br +
            $arBtnTitles[1] +
            "=" +
            $die +
            "=" +
            $("#sRole" + $die).html() +
            $br +
            $arBtnTitles[1] +
            "=" +
            $bdie +
            "=" +
            $("#sRole" + $bdie).html() +
            $br +
            $arBtnTitles[2] +
            "=" +
            $stole +
            "=" +
            $("#sRole" + $stole).html() +
            $br +
            $arBtnTitles[3] +
            "=" +
            $cure +
            "=" +
            $("#sRole" + $cure).html() +
            $br +
            $arBtnTitles[5] +
            "=" +
            $bcure +
            "=" +
            $("#sRole" + $bcure).html() +
            $br +
            $arBtnTitles[8] +
            "=" +
            $boom +
            "=" +
            $("#sRole" + $boom).html() +
            $br +
            $arBtnTitles[9] +
            "=" +
            $foul +
            "=" +
            $("#sRole" + $foul).html()
    );
}

// Функция обновления отображения таймера игры
function updateGameTimerDisplay() {
    let minutes = Math.floor($gameTime / 60);
    let seconds = $gameTime % 60;
    let timeString = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);

    // Обновляем только первый элемент с классом clNums (заголовок)
    $(".clNums")
        .first()
        .html("🕒 " + timeString);
}

// Функция для немедленного обновления счётчиков после смерти игрока
function updateCountersAfterDeath(playerId) {
    // Получаем роль умершего игрока
    let role = $("#sRole" + playerId).html();

    // Если игрок был мирным (включая все мирные роли)
    if (role != $arRoles[2] && role != $arRoles[3]) {
        $sitizenCnt--;
    }
    // Если игрок был мафией или доном
    else if (role == $arRoles[2] || role == $arRoles[3]) {
        $maffCnt--;
    }

    // Обновляем ID ролей, если умер игрок с особой ролью
    if ($idMedic == playerId) $idMedic = -Math.abs($idMedic);
    if ($idManiac == playerId) $idManiac = -Math.abs($idManiac);
    if ($idDetective == playerId) $idDetective = -Math.abs($idDetective);
    if ($idBomber == playerId) $idBomber = -Math.abs($idBomber);
    if ($idBoss == playerId) $idBoss = -Math.abs($idBoss);
    if ($idBeauty == playerId) $idBeauty = -Math.abs($idBeauty);
    if ($idThief == playerId) $idThief = -Math.abs($idThief);
    if ($idImmortal == playerId) $idImmortal = -Math.abs($idImmortal);
    if ($idShahid == playerId) $idShahid = -Math.abs($idShahid);

    if ($Debug) {
        $("#dDebug").html("Обновлено после смерти: Мирных=" + $sitizenCnt + ", Мафии=" + $maffCnt);
    }
}
