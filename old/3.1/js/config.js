//~ Версия 3.1
//~ Файл пользовательских настроек
//~ Здесь можно менять установки, не изменя названия переменных
$(document).ready(function() {
	$Debug=false; // Дебаггинг (вывод служебной информации в дополнительное поле)
	$waitTimerDefault1=60; // Таймер 1 в секундах
	$waitTimerDefault2=30; // Таймер 2 в секундах
	$minGamers=6; // Минимальное количество игроков для игры
	$maxFoul=5; // Количество фолов, при котором игрок выбывает
	$useFoulsDay=false; // Использовать фолы ночью?
	$useFoulsNight=true; // Использовать фолы днём?

	// Роли, используемые в игре
	// Роли нельзя менять местами, так как механизм скрипта завязан на идентификаторы.
	// Названия ролей менять можно
	$arRoles=Array();
	$arRoles[1]='Мирный'; 
	$arRoles[2]='МАФИЯ';
	$arRoles[3]='ДОН';
	$arRoles[4]='Шериф';
	$arRoles[5]='Доктор';
	$arRoles[6]='Красотка';
	$arRoles[7]='Маньяк';
	$arRoles[8]='Бессмертный';
	$arRoles[9]='Вор';
	$arRoles[10]='Смертник';
	$arRoles[11]='Шахид';     // Pashulik

	// Можно указать, участвуют или нет роли в игре
	// 1 - роль участвует в игре
	// 0 - роль НЕ участвует в игре
	// Мирные жители и мафиози всегда принимают участие в игре
	$arRolePlay=Array();
	$arRolePlay[3]=1;  // Дон
	$arRolePlay[4]=1;  // Шериф
	$arRolePlay[5]=0;  // Доктор
	$arRolePlay[6]=0;  // Красотка
	$arRolePlay[7]=1;  // Маньяк
	$arRolePlay[8]=0;  // Бессмертный
	$arRolePlay[9]=0;  // Вор
	$arRolePlay[10]=0; // Смертник
	$arRolePlay[11]=1; // Шахид

	// Минимальное количество игроков для каждой роли
	$arRoleMinPlayers=Array();
	$arRoleMinPlayers[3]=7;  // Дон
	$arRoleMinPlayers[4]=7;  // Шериф
	$arRoleMinPlayers[5]=6;  // Доктор
	$arRoleMinPlayers[6]=7;  // Красотка
	$arRoleMinPlayers[7]=12; // Маньяк
	$arRoleMinPlayers[8]=7;  // Бессмертный
	$arRoleMinPlayers[9]=11; // Вор
	$arRoleMinPlayers[10]=15; // Смертник
	$arRoleMinPlayers[11]=15; // Шахид

	// Названия кнопок и отметок в протоколе
	// Можно указывать html-формат символов типа &#8258; - но это не во всех браузерх работает!
	// Коды можно глянуть тут: http://an-site.ru/utf.htm
	$arBtnTitles=Array();
	$arBtnTitles[1]="✘";       // для убийства ночью
	$arBtnTitles[2]="В";        // для вора
	$arBtnTitles[3]="✚";       // для лечения
	$arBtnTitles[4]="✔";       // для проверки шерифом
	$arBtnTitles[5]="❤";       // для спасения красоткой
	$arBtnTitles[6]="M";        // для убийства маньяком
	$arBtnTitles[7]="✕";       // для убийства днём
	$arBtnTitles[8]="&#9760;";  // для взрыва смертника
	$arBtnTitles[9]="❢"; // для замечания игроку ведущим (фола)
	
	// Настройки таймеров (будут перезаписаны из localStorage при загрузке)
$timerSettings1 = {
    enabled: true,		// звук включён
    duration: 60,		// секунд до срабатывания
    beepDuration: 0.5,	// Короткий сигнал – длительность (сек)
    beepFreq: 600,		// Короткий сигнал – частота (Гц)
    beepVolume: 0.8,	// Короткий сигнал – громкость (0–1)
    alarmDuration: 1.5,	// Финальный сигнал – длительность (сек)
    alarmFreq: 1200,	// Финальный сигнал – частота (Гц)
    alarmVolume: 0.8	// Финальный сигнал – громкость (0–1)
};
$timerSettings2 = {
    enabled: true,
    duration: 30,
    beepDuration: 0.5,
    beepFreq: 600,
    beepVolume: 0.8,
    alarmDuration: 1.5,
    alarmFreq: 1200,
    alarmVolume: 0.8
};

});