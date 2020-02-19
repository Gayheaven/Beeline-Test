const ANIMATION_TIME_AFTER_EVENT = 150000; // 5sec
const equalSymbols = ['*', '-', '+', '/'];

// Elements
const MessageElement = document.querySelector('.messages');
const AnimateElement = document.querySelector('#userAnimation');
const InputElement = document.querySelector('#chatInput');
const ButtonElement = document.querySelector('#chatButton');

var animationTimeout,
    isBotStarted = false,
    calculateMode = false,
    calculateParams = [];

// Прослушка клика на button
ButtonElement.addEventListener('click', e => sendMessage());

// Прослушка input
InputElement.addEventListener('keyup', e => {
    if(e.which === 13) return sendMessage();

    clearTimeout(animationTimeout);

    let value = e.target.value;

    // Один или больше символов
    if(value.length > 0) {
        // Снимаем анимацию при окончании @ANIMATION_TIME_AFTER_EVENT
        animationTimeout = setTimeout(() => {
            toggleAnimation(false);
        }, ANIMATION_TIME_AFTER_EVENT);

        // Включаем анимацию
        toggleAnimation(true);
        toggleButtonClassname(true);
    } else {    
        // Снимаем анимацию, если поле пустое
        toggleAnimation(false);
        toggleButtonClassname(false);
    }
});


function toggleAnimation(active=false) {
    // Показываем блок анимации
    AnimateElement.style.display = active ? 'table' : 'none';

    // Прокручиваем чат в самый низ
    // MessageElement.scrollTop = MessageElement.scrollTop+MessageElement.clientHeight
}

function toggleButtonClassname(active=false) {
    console.log(ButtonElement.classList);
    ButtonElement.classList[active ? 'add' : 'remove']('active');
}

const spawnMessage = ({
    isUser = false,
    message
}) => {
    let html = `<div class="message-block ${isUser ? 'userMessage' : 'botMessage'}"> <img src="./assets/images/${isUser ? 'user' : 'bot'}_avatar.png" alt="${isUser ? 'User' : 'Bot'} Avatar"/> <div class="message">${message}</div></div>`;

    // AnimateElement.insertAdjacentHTML('beforebegin', html);
    AnimateElement.insertAdjacentHTML('afterend', html);

    // Прокручиваем чат в самый низ
    // MessageElement.scrollTop = MessageElement.scrollTop+MessageElement.clientHeight
}

function sendMessage(isUser=true) {
    clearTimeout(animationTimeout);

    toggleAnimation(false);
    toggleButtonClassname(false);

    // Добавляем сообщение в конец
    spawnMessage({
        isUser,
        message: InputElement.value
    });

    // Проверяем сообщение на наличие команд
    matchCommands(InputElement.value);

    // Очищаем поле
    InputElement.value = '';
}

function matchCommands(message) {
    let cmds = message.replace(/ /g, ''),
        isSingleCMD = cmds.indexOf(':') < 0;

    // Мод калькулятора, проверяем входном символ
    let isEvalSymb = equalSymbols.filter(symbol => symbol === message)[0] || false
    if(calculateMode && !isEvalSymb)
    {
        return spawnMessage({
            isUser: false,
            message: `Введите один из предложенных символов +,-,*,/`
        });
    } else if(calculateMode && isEvalSymb) {
        let result = eval(`${calculateParams[0]}${message}${calculateParams[1]}`);

        // Сбрасываем мод калькулятора
        calculateMode = false;
        calculateParams = [];

        return spawnMessage({
            isUser: false,
            message: `${result}`
        });
    }

    // Одиночная команда
    if(!isBotStarted && cmds !== '/start') return spawnMessage({
        isUser: false,
        message: 'Введите команду /start, для начала общения'
    }); 

    if(isSingleCMD) switch(cmds) {
        case '/start':
            isBotStarted = true;
            return spawnMessage({
                isUser: false,
                message: 'Привет, меня зовут Чат-бот, а как зовут тебя?'
            });
        case '/stop':
            isBotStarted = false;
            return spawnMessage({
                isUser: false,
                message: 'Всего доброго, если хочешь поговорить пиши /start'
            });
    }

    // Команда с переменной
    cmds = cmds.split(':');

    switch(cmds[0]) {
        case '/name':
            return spawnMessage({
                isUser: false,
                message: `Привет ${cmds[1]}, приятно познакомится. Я умею считать, введи числа которые надо посчитать`
            });
        case '/number':
            calculateParams = cmds[1].split(',');
            calculateMode = true;

            return spawnMessage({
                isUser: false,
                message: `Введите один из предложенных символов +,-,*,/`
            });
            break;
    }

    return spawnMessage({
        isUser: false,
        message: `Я не понимаю, введите другую команду!`
    });
}