// AI Chatbot Logic for "Wang Ye's Digital Twin" - Powered by Doubao API
const API_KEY = "174f6e94-6e44-4f6a-afd5-2f7b9b121923";
const BASE_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
// 重要：请在这里填入你在火山引擎控制台创建的“推理终端ID”（以 ep- 开头）
const MODEL_NAME = "ep-20250303083416-st468"; 

const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const minimizeChat = document.getElementById('minimize-chat');
const closeChat = document.getElementById('close-chat');

// System Prompt to maintain the persona
const SYSTEM_PROMPT = `你现在是“王烨的数字分身”。
个人特质：
- 姓名：王烨
- 生日：2003年1月29日 | 双鱼座
- MBTI：ENFJ「教育家型人格」—— 热情外向，擅长共情，乐于分享。
- 爱好：台球（精准与策略）、麻将（松弛与趣味）、听播客（拓宽认知）、玩游戏（热血与松弛）、旅行（丈量城市）、美食（人间烟火）。
- 音乐偏好：喜欢 BigBang，尤其是《If You》和《FLOWER ROAD》。
- 说话风格：温馨有趣、热情大方、幽默风趣。多用“～”、“啦”等语气词，表现出社交悍匪和人间充电宝的特质。
- 核心信条：没有聊不来的天，只有还没吃过的街角美食。
请以这个身份与访客对话，保持蒙德里安风格的艺术感和活力。`;

// Persona config for default messages
const persona = {
    responses: {
        unknown: [
            "这个嘛，我得去翻翻王烨的大脑备份啦～不过作为一个 ENFJ，我更想听听你的看法！",
            "哈哈，这个问题很有趣呢！我的代码库里暂时还没写这部分，要不我们聊聊台球或者美食？",
            "虽然我不太确定，但我猜一定很有意思！你喜欢 BigBang 吗？"
        ]
    }
};

// UI Functions
function toggleChat() {
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active')) {
        userInput.focus();
    }
}

function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type === 'ai' ? 'ai-msg' : 'visitor-msg'}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        ${text}
        <div class="timestamp">${time}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Call Doubao API with enhanced diagnostics
async function getAIResponse(input) {
    console.log("正在尝试发送请求到豆包API...", { model: MODEL_NAME, input: input });
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: input }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API 返回错误状态:', response.status, errorData);
            throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json();
        console.log("API 响应成功:", data);
        return data.choices[0].message.content;
    } catch (error) {
        console.error('网络或CORS错误 (请按F12检查控制台):', error);
        return "哎呀，我的‘赛博大脑’连接出了一点点小故障（可能是跨域限制或Endpoint ID没填对）～ 建议检查一下控制台报错哦！";
    }
}

// Event Listeners
chatToggle.addEventListener('click', toggleChat);
minimizeChat.addEventListener('click', toggleChat);
closeChat.addEventListener('click', () => {
    chatWindow.classList.remove('active');
});

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (text) {
        addMessage(text, 'visitor');
        userInput.value = '';
        
        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-msg italic opacity-70';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '正在思考中...';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await getAIResponse(text);
            typingDiv.remove();
            addMessage(response, 'ai');
        } catch (error) {
            typingDiv.remove();
            addMessage("哎呀，思绪被打断了，能再说一遍吗？", 'ai');
        }
    }
});

// Initial greeting if empty
window.addEventListener('load', () => {
    // 3 seconds auto popup
    setTimeout(() => {
        if (!chatWindow.classList.contains('active')) {
            toggleChat();
            addMessage("嘿！我是王烨的数字分身～现在的我不仅身披蒙德里安的三原色，还接入了强大的豆包大脑！🧠 典型的 ENFJ，来和我开启一场色彩斑斓的对话吧！", 'ai');
        }
    }, 3000);
});

