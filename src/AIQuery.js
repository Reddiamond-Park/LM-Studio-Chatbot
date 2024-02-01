import React, { useState } from 'react';
import './AIQUery.css';

let controller = null;

const AIQuery = () => {
  const API_URL = process.env.REACT_APP_FETCH_URL;
  const [state, setState] = useState({
    inputText: '',
    generateBtn: false,
    stopBtn: false,
    resultText: '',
  });

  const generate = async () => {
    if (!state.inputText) {
      alert('Please enter a prompt.');
      return;
    }

    setState({
      ...state,
      generateBtn: false,
      stopBtn: true,
      resultText: 'Generating...',
    });

    controller = new AbortController();

    let contents = '';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            // { role: 'system', content: 'Always answer in rhymes.' },
            { role: 'user', content: state.inputText },
          ],
          temperature: 0.7,
          max_tokens: -1,
          stream: true,
        }),
        signal: controller.signal,
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        const parsedLines = lines
          .map(line => line.replace(/^data: /, '').trim())
          .filter(line => line !== '' && line !== '[DONE]')
          .map(line => JSON.parse(line));

        for (const parsedLine of parsedLines) {
          const { choices } = parsedLine;
          const { delta } = choices[0];
          const { content } = delta;

          if (content) {
            contents = contents + content;
            setState({ ...state, resultText: contents, generateBtn: false, stopBtn: true });
          }
        }
      }
    } catch (error) {
      if (controller.signal.aborted) {
        contents += '\n\n *** Request aborted.';
      } else {
        contents += '\n\n *** Error occurred while generating.';
      }
    } finally {
      controller = null;
      setState({
        ...state,
        generateBtn: state.inputText ? true : false,
        stopBtn: controller ? true : false,
        resultText: contents,
      });
    }
  };

  const stop = () => {
    if (controller) {
      controller.abort();
    }
  };

  const onKeyUp = e => {
    if (e.key === 'Enter') {
      generate();
    }
  };
  const onChange = e => {
    setState({ ...state, inputText: e.target.value, generateBtn: e.target.value ? true : false });
  };

  return (
    <div>
      <div>
        <h1>Chatbot</h1>
        <p>Generated Text from Mistral AI data model </p>
      </div>
      <ResultText resultText={state.resultText} />
      <div>
        <InputText onKeyUp={onKeyUp} onChange={onChange} />
        <div>
          <Button btnLable={'Genrate'} btnDisable={state.generateBtn} onClick={generate} />
          <Button btnLable={'Stop'} btnDisable={state.stopBtn} onClick={stop} />
        </div>
      </div>
    </div>
  );
};

const ResultText = ({ resultText }) => {
  return (
    <div className="container">
      <div className="autoscrollable-container">
        <div className="autoscrollable-wrapper">
          <div className="scroll-text">{resultText}</div>
        </div>
      </div>
    </div>
  );
};

const InputText = ({ onKeyUp, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Enter prompt..."
      style={{ width: '800px', height: '26px', fontSize: '1em', margin: '30px 40px 10px 40px' }}
      onKeyUp={onKeyUp}
      onChange={onChange}
    ></input>
  );
};

const Button = ({ btnLable, btnDisable, onClick }) => {
  return (
    <button
      style={{ width: '290px', height: '28px', fontSize: '1em', margin: '0px 10px 10px 0px' }}
      disabled={!btnDisable}
      onClick={onClick}
    >
      {btnLable}
    </button>
  );
};

export default AIQuery;
