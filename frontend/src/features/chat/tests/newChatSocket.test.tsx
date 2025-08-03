import SocketService from '../../websocket/socketService';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { ChatMessage } from "../dataTypes";
import { NamespacePayload } from '@features/websocket/types/socketTypes';
import { JoinRoomPayload } from '../socketEvents';

describe('WEB SOCKET TESTING', () => {
  let socketService: SocketService;
  const mockToken = 'test-token';
  const mockUsername = 'test-user';
  const mockUserId = 'user-123';

  beforeEach(() => {
    socketService = new SocketService();
  });

  afterEach(() => {
    socketService.disconnect();
  });

  describe('Connection', () => {
    test('should connect successfully with valid credentials', async () => {
      await expect(socketService.connect(mockToken, mockUsername, mockUserId))
        .resolves.not.toThrow();
    });

    test('should reject when connection fails', async () => {
      await expect(socketService.connect('invalid', '', ''))
        .rejects.toThrow();
    });
  });

  describe('Inviidual Socket.IO Connections', () => {
      let socket: Socket;
      let chatSocket: Socket;

      beforeEach((done) => {
          socket = io('http://localhost:8000', {
              transports: ['websocket'],
              upgrade: false, // Critical for WebSocket-only
              debug: true,
              auth: {
                  token: mockToken,
                  username: mockUsername,
                  user_id: mockUserId 
              }
          });

          // Wait for main socket connection
          socket.on('connect', () => {
              chatSocket = io('http://localhost:8000/chat', {
                  transports: ['websocket'],
                  upgrade: false,
                  auth: {
                    token: mockToken,
                    username: mockUsername,
                    user_id: mockUserId 
                  } 
              });
              chatSocket.on('connect', done);
          });
      });

      afterEach((done) => {
          if (chatSocket?.connected) chatSocket.disconnect();
          if (socket?.connected) {
              const timeout = setTimeout(() => {
                  done(new Error("Socket did not disconnect in time"));
              }, 1000); // 1 second timeout

              socket.once('disconnect', () => {
                  clearTimeout(timeout);
                  done();
              });

              socket.disconnect();
          } else {
              done();
          }

      });

      test('root namespace communication', async () => {
          await new Promise<void>((resolve) => {
              socket.emit('hello_to_root', { yes: '3232' }, (response: any) => {
                  console.log('Root response:', response);
                  expect(response).toHaveProperty('success', true);
                  expect(response).toHaveProperty('namespace', 'root');

                  resolve();
              });
          });
      });

      test('chat namespace communication: event does not exist', async () => {
          const fakeEvent = 'hello_to_chat';
          await new Promise<void>((resolve) => {
              chatSocket.emit(fakeEvent, { message: 'This event should not exist' }, (response: any) => {
                  console.log('Chat response:', response);
                  expect(response).toHaveProperty('success', false);
                  expect(response).toHaveProperty('from', 'chat trigger');
                  expect(response).toHaveProperty('error', `No handler for event: ${fakeEvent}`);
                  resolve();
              });
          });
        });

      test('chat namespace communication: even exists, payload is invalid', async () => {
          const realEvent = "message";
          await new Promise<void>((resolve) => {
              chatSocket.emit(realEvent, { message: 'This event should exist, but throws room id error'}, (response: any) => {
                  console.log('Chat response:', response);
                  expect(response).toHaveProperty('success', false);
                  expect(response).toHaveProperty('from', 'chat validate_payload decorator');
                  expect(response).toHaveProperty('error', `Invalid payload`);
                  resolve();
              });
          });


      });

});

  describe('Multi Socket.IO Connections', () => {
    let socket: Socket;
    let chatSocket: Socket;

    beforeEach((done) => {
      socket = io('http://localhost:8000', {
        transports: ['websocket'],
        upgrade: false,
        debug: true,
        auth: {
          token: mockToken,
          username: mockUsername,
          user_id: mockUserId,
        },
      });

      socket.on('connect', () => {
        chatSocket = io('http://localhost:8000/chat', {
          transports: ['websocket'],
          upgrade: false,
          auth: {
            token: mockToken,
            username: mockUsername,
            user_id: mockUserId,
          },
        });
        chatSocket.on('connect', done);
      });
    });

    afterEach(() => {
      socket.disconnect();
      chatSocket.disconnect();
    });

    test('multi sockets', async () => {
      try {
        const response = await axios.post('http://localhost:8000/api/chat/create', {
          name: 'CoolRoom42',
          creator_id: 'user_123',
          room_id: 'room_42',
          max_participants: 100,
        });

        expect(response.data).toHaveProperty('name', 'CoolRoom42');
        expect(response.data).toHaveProperty('creator_id', 'user_123');
        expect(response.data).toHaveProperty('room_id', 'room_42');
      } catch (error) {
        console.error('Error:', error);
      }
    });
  });


  describe.only("SocketService Connections", () => {
    let socket: Socket;
    let chatSocket: Socket;
    let socketService: SocketService;

    beforeEach(() => {
      socketService = new SocketService();
      socketService.connect("test-token", "test-user-id", "test-user-id");
      socket = socketService.mainSocket;
    });

    afterEach(() => {
      socketService.disconnect();
      // if (chatSocket) chatSocket.disconnect();
    });

    test("Main.py : Fail to connect due to invalid handler ", async () => {

      socket.on("connect", () => {
        expect(socket.connected).toBe(true);
      });
      // expect(socket.connected).toBe(true);

      // Example emit/test
      const response = await new Promise<any>((resolve) => {
        socket.emit("main root hello", { test: true }, (res: any) => {
          resolve(res);
        });
      });

      expect(response).toHaveProperty("success", false);
      expect(response).toHaveProperty("from", "ROOT EVENTS trigger");
      expect(response).toHaveProperty("error", "No handler for event: main root hello");

    });

      test.only("Main.py : Fail to connect with suscribe handler with invalid payload ", async () => {
        socket.on("connect", () => {
          expect(socket.connected).toBe(true);
        });
        // expect(socket.connected).toBe(true);

        // Example emit/test
        const response = await new Promise<any>((resolve) => {
          socket.emit("subscribe", { invalidArg: "notifications" }, (res: any) => {
            resolve(res);
          });
        });

        expect(response).toHaveProperty("success", false);
        expect(response).toHaveProperty("error", "Invalid subscription payload");

      });

      test("Main.py : Successfully connect and use suscribe handler with valid payload ", async () => {
        socket.on("connect", () => {
          expect(socket.connected).toBe(true);
        });
        // expect(socket.connected).toBe(true);

        // Example emit/test
        const response = await new Promise<any>((resolve) => {
          socket.emit("subscribe", { event: "notifications" }, (res: any) => {
            resolve(res);
          });
        });

        expect(response).toHaveProperty("success", true);
        expect(response).toHaveProperty("event", "notifications");

      });


    test("Namespace Connection", async () => {

      socket.on("connect", () => {
        expect(socket.connected).toBe(true);
      });

      chatSocket = await socketService.addNamespace('/chat');
      chatSocket.on("connect", () => {
        expect(chatSocket.connected).toBe(true);
      });

      // chatSocket.
      
      // Example emit/test
      const response = await new Promise<any>((resolve) => {
        chatSocket.emit("hello", { test: true }, (res: any) => {
          resolve(res);
        });
      });

      console.log(response);
      expect(response).toHaveProperty("success", false);
      expect(response).toHaveProperty("from", "chat trigger");
      expect(response).toHaveProperty("error", "No handler for event hello");

    });


    test.only("Namespace Connection: Message Sending (with emit)", async () => {

      socket.on("connect", () => {
        expect(socket.connected).toBe(true);
      });

      chatSocket = await socketService.addNamespace('/chat');
      chatSocket.on("connect", () => {
        expect(chatSocket.connected).toBe(true);
      });

      // chatSocket.
      
      // Example emit/test
      const response = await new Promise<any>((resolve) => {
        chatSocket.emit("hello", { test: true }, (res: any) => {
          resolve(res);
        });
      });

      console.log(response);
      expect(response).toHaveProperty("success", false);
      expect(response).toHaveProperty("from", "chat trigger");
      expect(response).toHaveProperty("error", "No handler for event: hello");

    });


  test.only("Namespace Connection: Message Sending (with socketService.send)", async () => {
    // Wait for main socket connection (optional, if needed)
    await new Promise<void>((resolve) => {
      socket.on("connect", () => {
        expect(socket.connected).toBe(true);
        resolve();
      });
    });

    // Add and wait for chat namespace connection
    chatSocket = await socketService.addNamespace('/chat');
    await new Promise<void>((resolve) => {
      chatSocket.on("connect", () => {
        expect(chatSocket.connected).toBe(true);
        resolve();
      });
    });

    // Emit using chatSocket and wait for callback response
    const responseFromEmit = await new Promise<any>((resolve) => {
      chatSocket.emit("hello", { test: true }, (res: any) => {
        resolve(res);
      });
    });

    expect(responseFromEmit).toHaveProperty("success", false);
    expect(responseFromEmit).toHaveProperty("error");

    // Use your socketService.sendToNamespace wrapped in a Promise for await

      const messagePayload: NamespacePayload<ChatMessage> = {
        event: 'message',
        data: {
          id: crypto.randomUUID(),
          user_id: mockUserId,
          username: mockUsername,
          message: "Hello, this is a test message.",
          timestamp: Date.now(),
          type: "chat",
          room_id: "lobby"
        }
      };

      let responseFromSendToNamespace = await socketService.sendToNamespace( 'chat',  messagePayload );

      console.log(responseFromSendToNamespace);
      expect(responseFromSendToNamespace).toHaveProperty("success", false);
      expect(responseFromSendToNamespace).toHaveProperty("error");


      const joinPayload: NamespacePayload<JoinRoomPayload> = {
        event: 'join_room',
        data: {
          id: crypto.randomUUID(),
          user_id: mockUserId,
          username: mockUsername,
          room_id: "lobby"
        }
      };

      responseFromSendToNamespace = await socketService.sendToNamespace( 'chat',  joinPayload );
      console.log(responseFromSendToNamespace);
      expect(responseFromSendToNamespace).toHaveProperty("success", true);

      responseFromSendToNamespace = await socketService.sendToNamespace( 'chat',  messagePayload );

      console.log(responseFromSendToNamespace);
      expect(responseFromSendToNamespace).toHaveProperty("success", true);
      expect(responseFromSendToNamespace).toHaveProperty("error", null);


  });



  });



  describe('Subscription Handling', () => {
    beforeEach(async () => {
      await socketService.connect(mockToken, mockUsername, mockUserId);
    });

    test('should subscribe to events and return unsubscribe', async () => {
      const handler = jest.fn();
      const unsubscribe = await socketService.subscribe('test-event', handler);
      
      expect(typeof unsubscribe).toBe('function');
      
      // Test handler is called
      socketService.send({ event: 'test-event', payload: { data: 'test' } });
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(handler).toHaveBeenCalledWith({ data: 'test' });
      
      // Test unsubscribe
      unsubscribe();
      socketService.send({ event: 'test-event', payload: { data: 'test2' } });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    test('should support multiple handlers per event', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      const unsub1 = await socketService.subscribe('multi-event', handler1);
      const unsub2 = await socketService.subscribe('multi-event', handler2);

      socketService.send({ event: 'multi-event', payload: { data: 'test' } });
      await new Promise(resolve => setTimeout(resolve, 500));
      // await socketService.waitForEvent('multi-event');

      // expect(handler1).toHaveBeenCalled();
      // expect(handler2).toHaveBeenCalled();

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();

      unsub1();
      unsub2();
    });

    test('should clean up when last handler unsubscribes', async () => {
      const handler = jest.fn();
      const unsubscribe = await socketService.subscribe('cleanup-event', handler);
      
      unsubscribe();
      
      // Verify the socket no longer has the handler
      socketService.send({ event: 'cleanup-event', payload: { data: 'test' } });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Namespace Handling', () => {
    test('should create namespace connections', async () => {
      await socketService.connect(mockToken, mockUsername, mockUserId);
      const nsSocket = await socketService.addNamespace('/chat');


      nsSocket.emit('asdasd', {"asdsadas": 'asdsadsada'})

      // needs to replaced with an eventdriven approach.
      await new Promise(resolve => setTimeout(resolve, 5000));

      console.log(nsSocket);

      expect(nsSocket).toBeDefined();
      expect(nsSocket.connected).toBeTruthy();
    }, 10000);

    test('should handle namespace subscriptions', async () => {
      await socketService.connect(mockToken, mockUsername, mockUserId);
      const nsSocket = await socketService.addNamespace('/chat');
      

      const handler = jest.fn();
      const unsubscribe = socketService.subscribeToNamespace('/chat', 'message', handler);
      
      // Send message through the namespace
      nsSocket.emit('message', { text: 'Hello from nSocket' });
      nsSocket?.send('asdasda', {'asdsad': 'asdsadasdsa'});
      nsSocket?.emit('asdasd', {"asdsadas": 'asdsadsada'})

      await new Promise(resolve => setTimeout(resolve, 15000));

      expect(handler).toHaveBeenCalledWith({ text: 'Hello' });
      
      unsubscribe();
    }, 20000);

    test('should support multiple namespace handlers', async () => {
      await socketService.connect(mockToken, mockUsername, mockUserId);
      const nsSocket = await socketService.addNamespace('/chat');
      
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      const unsub1 = socketService.subscribeToNamespace('/chat', 'update', handler1);
      const unsub2 = socketService.subscribeToNamespace('/chat', 'update', handler2);

      nsSocket.emit('update', { version: 2 });
      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();

      unsub1();
      unsub2();
    });
  });

  describe('Error Handling', () => {
    test('should throw when subscribing without connection', async () => {
      await expect(socketService.subscribe('event', jest.fn()))
        .rejects.toThrow('Socket not connected');
    });
  });

  describe('Bulk Operations', () => {
    test('unsubscribeAll should remove all handlers', async () => {
      await socketService.connect(mockToken, mockUsername, mockUserId);
      
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      await socketService.subscribe('bulk-event', handler1);
      await socketService.subscribe('bulk-event', handler2);
      
      socketService.unsubscribeAll('bulk-event');
      
      socketService.send({ event: 'bulk-event', payload: {} });

      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    test('should clean up all namespaces on disconnect', async () => {
      await socketService.connect(mockToken, mockUsername, mockUserId);
      const nsSocket = await socketService.addNamespace('/chat');
      
      socketService.disconnect();

      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(nsSocket.connected).toBeFalsy();
    });
  });
});