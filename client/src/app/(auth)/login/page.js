import LoginForm from '@/components/auth/LoginForm';

export const metadata = { title: 'Log in' };

// `next` is read on the server so the form itself is server-rendered (no blank flash).
export default async function LoginPage(props) {
  const { next } = await props.searchParams;
  return <LoginForm next={typeof next === 'string' ? next : undefined} />;
}
