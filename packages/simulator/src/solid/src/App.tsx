import { type Component } from 'solid-js';

import { Ascii } from './components/Ascii';
import { Emulator } from './components/emulator/Emulator';
import { MockThread } from './components/emulator/mocks';

const App: Component = () => {
  return (
    <div class="mx-auto max-w-3xl">

      <div class="flex justify-center mt-12">
        <Ascii />
      </div>

      <Emulator
        agent={{
          iconUrl: "https://www.nike.com/favicon.ico",
          brandName: "Nike"
        }}
        initialThread={MockThread}
        onSendMessage={(payload) => console.log({ payload })}
      />
    </div>
  );
};

export default App;
