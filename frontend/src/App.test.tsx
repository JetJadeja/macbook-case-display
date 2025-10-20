import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CaseCanvas title', () => {
  render(<App />);
  const titleElement = screen.getByText(/CaseCanvas/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders name input form', () => {
  render(<App />);
  const nameInput = screen.getByPlaceholderText(/Enter your name/i);
  expect(nameInput).toBeInTheDocument();
});
