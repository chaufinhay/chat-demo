import {Chat} from '@/components/Chat/Chat';
import {Footer} from '@/components/Layout/Footer';
import {Navbar} from '@/components/Layout/Navbar';
import {Message} from '@/types';
import Head from 'next/head';
import React, {useEffect, useRef, useState} from 'react';
import '@master/css';

function useLocalStorage(key: string, initialValue: string): [string, (value: string) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState((): string => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    const item = window.localStorage.getItem(key);
    return item || initialValue;
  });

  const setValue = (value: string): void => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue];
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useLocalStorage('userName', '');
  const [userTitle, setUserTitle] = useLocalStorage('userTitle', 'mr');
  const [isShowChat, setIsShowChat] = useState<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  const handleStartChat = () => {
    if (!userName || !userTitle) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setIsShowChat(true);
    setMessages([
      {
        role: 'assistant',
        content: `Chào ${userTitle === 'mr' ? 'anh' : 'chị'} ${userName}. Em là Nhy, trí tuệ nhân tạo phát triển bởi Finhay để hỗ trợ khách hàng đầu tư ạ.`
      }
    ]);
  }

  const handleSend = async (message: Message) => {
    const updatedMessages = [...messages, message];

    setMessages(updatedMessages);
    setLoading(true);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: updatedMessages,
        name: `${userTitle} ${userName}`,
      })
    });

    if (!response.ok) {
      setLoading(false);
      throw new Error(response.statusText);
    }

    const data = await response.json();
    if (!data) {
      return;
    }

    setLoading(false);
    setMessages((messages) => [
      ...messages,
      {
        role: 'assistant',
        content: data.answer
      }
    ]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
      <>
        <Head>
          <title>NHY</title>
          <meta
              name="description"
              content="NHY"
          />
          <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
          />
        </Head>

        <div className="flex flex-col h-screen">
          <Navbar/>

          <div className="flex-1 overflow-auto sm:px-10 pb-4 sm:pb-10">
            {isShowChat ? (
                <div className="max-w-[800px] mx-auto mt-4 sm:mt-12">
                  <Chat
                      messages={messages}
                      loading={loading}
                      onSend={handleSend}
                  />
                  <div ref={messagesEndRef}/>
                </div>
            ) : (
                <div className="max-w:800 mx:auto mt:10 flex flex:col gap:20">
                  <img src="/nhyv1.webp" alt="" className={'w:300'}/>
                  <div className={'flex gap:20 ai:center'}>
                    <label className="f:bold f:18" htmlFor="title">Xưng hô</label>
                    <select className={'b:1|solid|gray-80 p:8|10 r:10'} name="title" id="title"
                            onChange={e => setUserTitle(e.target.value)}
                            value={userTitle as string}>
                      <option value="mr">Anh</option>
                      <option value="mrs">Chị</option>
                    </select>
                  </div>
                  <div className={'flex gap:20 ai:center'}>
                    <label className="f:bold f:18" htmlFor="userName">Tên</label>
                    <input className={'b:1|solid|gray-80 p:8|10 r:10'} type="text" id="userName"
                           onChange={e => setUserName(e.target.value)}
                           value={userName as string}/>
                  </div>
                  <div>
                    <button className={'b:1|solid|gray-80 p:8|10 r:10 bg:blue-80 c:white f:bold f:18'}
                            onClick={handleStartChat}>Bắt đầu
                    </button>
                  </div>
                </div>
            )}

          </div>
          <Footer/>
        </div>
      </>
  );
}
