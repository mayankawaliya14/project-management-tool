import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { ADD_TASK_COMMENT } from "../graphql/mutations";
import { useState } from "react";

const GET_TASK_COMMENTS = gql`
  query GetTaskComments($projectId: ID!) {
    tasks(projectId: $projectId) {
      id
      comments {
        id
        content
        authorEmail
        createdAt
      }
    }
  }
`;

export default function TaskComments({ taskId, projectId }: { taskId: string; projectId: string }) {
  const [content, setContent] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  
  const { data, refetch } = useQuery(GET_TASK_COMMENTS, {
    variables: { projectId },
  });
  
  const [addComment, { loading }] = useMutation(ADD_TASK_COMMENT, {
    variables: { taskId, content, authorEmail },
    onCompleted: () => {
      refetch();
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authorEmail.trim()) return;
    await addComment();
    setContent("");
  };

  const currentTask = data?.tasks?.find((task: any) => task.id === taskId);
  const comments = currentTask?.comments || [];

  return (
    <div className="bg-white rounded p-4 shadow">
      <div className="font-semibold mb-2">Comments</div>
      
      {/* Display existing comments */}
      <div className="mb-4 max-h-48 overflow-y-auto">
        {comments.length > 0 ? (
          <div className="space-y-2">
            {comments.map((comment: any) => (
              <div key={comment.id} className="border-l-4 border-gray-200 pl-3 py-2">
                <div className="text-sm font-medium text-gray-700">{comment.authorEmail}</div>
                <div className="text-sm text-gray-900">{comment.content}</div>
                <div className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No comments yet</p>
        )}
      </div>

      {/* Comment form */}
      <form className="flex flex-col gap-2 mb-2" onSubmit={submit}>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded px-2 py-1 min-w-0"
            placeholder="Your email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
          />
          <button
            disabled={loading}
            className="px-3 py-1 bg-indigo-600 text-white rounded flex-shrink-0"
          >
            Post
          </button>
        </div>
        <input
          className="w-full border rounded px-2 py-1"
          placeholder="Write a comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </form>
    </div>
  );
}
