import Agent from '@/components/Agent';
import { getCurrentUser } from '@/lib/actions/auth.action';

const page = async () => {
  const user = await getCurrentUser();

  return (
    <>
      <h3>Interview Generation</h3>
      <h1>
        How it works: You press the call button and the AI
        interviewer picks up the call. It will then ask you a few
        questions on{' '}
        <span style={{ textDecoration: 'underline' }}>how</span> you
        would like to tailor your interview. Which you then can
        choose from the homepage.
      </h1>
      <Agent
        userName={user?.name}
        userId={user?.id}
        type="generate"
      />
    </>
  );
};

export default page;
