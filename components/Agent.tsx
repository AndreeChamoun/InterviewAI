'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { interviewer } from '@/constants';
import { createFeedback } from '@/lib/actions/general.action';
import { cn } from '@/lib/utils';
import { vapi } from '@/lib/vapi.sdk';

enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

interface SavedMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(
    CallStatus.INACTIVE
  );
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>('');

  useEffect(() => {
    // Event listeners for call lifecycle events
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE); // Set call status to active when the call starts
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED); // Set call status to finished when the call ends
    };

    const onMessage = (message: Message) => {
      // Handle incoming messages (e.g., transcripts from the AI)
      if (
        message.type === 'transcript' &&
        message.transcriptType === 'final'
      ) {
        const newMessage = {
          role: message.role,
          content: message.transcript,
        };
        setMessages((prev) => [...prev, newMessage]); // Append the new message to the message list
      }
    };

    const onSpeechStart = () => {
      console.log('speech start');
      setIsSpeaking(true); // Indicate that the AI is speaking
    };

    const onSpeechEnd = () => {
      console.log('speech end');
      setIsSpeaking(false); // Indicate that the AI has stopped speaking
    };

    const onError = (error: Error) => {
      console.log('Error:', error); // Log any errors that occur during the call
    };

    // Attach event listeners to the vapi instance
    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('message', onMessage);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('error', onError);

    // Cleanup event listeners when the component unmounts
    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('message', onMessage);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
      vapi.off('error', onError);
    };
  }, []);

  useEffect(() => {
    // Update the last message whenever the messages array changes
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    // Function to generate feedback after the call ends
    const handleGenerateFeedback = async (
      messages: SavedMessage[]
    ) => {
      console.log('handleGenerateFeedback');

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages, // Send the transcript of the conversation
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`); // Navigate to the feedback page
      } else {
        console.log('Error saving feedback');
        router.push('/'); // Navigate to the home page on failure
      }
    };

    // Handle post-call actions based on the call type
    if (callStatus === CallStatus.FINISHED) {
      if (type === 'generate') {
        router.push('/'); // Navigate to the home page for "generate" type
      } else {
        handleGenerateFeedback(messages); // Generate feedback for other types
      }
    }
  }, [
    messages,
    callStatus,
    feedbackId,
    interviewId,
    router,
    type,
    userId,
  ]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING); // Set call status to connecting

    if (type === 'generate') {
      // Start a call using the VAPI workflow for "generate" type
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      // Format questions for the call
      let formattedQuestions = '';
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join('\n');
      }

      // Start a call with the interviewer and formatted questions
      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED); // Set call status to finished
    vapi.stop(); // Stop the call
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}{' '}
            {/* Show animation when AI is speaking */}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                'transition-opacity duration-500 opacity-0',
                'animate-fadeIn opacity-100'
              )}>
              {lastMessage} {/* Display the last message */}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== 'ACTIVE' ? (
          <button
            className="relative btn-call"
            onClick={() => handleCall()}>
            <span
              className={cn(
                'absolute animate-ping rounded-full opacity-75',
                callStatus !== 'CONNECTING' && 'hidden'
              )}
            />

            <span className="relative">
              {callStatus === 'INACTIVE' ||
              callStatus === 'FINISHED'
                ? 'Call' // Show "Call" when inactive or finished
                : '. . .'}{' '}
              {/* Show loading dots when connecting */}
            </span>
          </button>
        ) : (
          <button
            className="btn-disconnect"
            onClick={() => handleDisconnect()}>
            End {/* Show "End" button when the call is active */}
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
