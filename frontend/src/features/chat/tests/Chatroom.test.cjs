const userEvent = require('@testing-library/user-event');

test('sends a message when enter is pressed', async () => {
  // Setup and mocks...
  const user = userEvent.setup();

  render(
    <Provider store={mockStoreWithState}>
      <ChatRoom />
    </Provider>
  );

  const input = screen.getByRole('textbox');
  await user.type(input, 'Hello world{enter}');

  expect(mockSendMessage).toHaveBeenCalled();
});
