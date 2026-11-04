import React, { useState, useEffect } from 'react';
import { commentService } from '../../services/commentService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDateTime, getInitials } from '../../utils/formatters';
import { MessageSquare, Trash2, Send } from 'lucide-react';

export const CommentSection = ({ issueId }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    if (issueId) {
      fetchComments();
    }
  }, [issueId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await commentService.getCommentsByIssue(issueId);
      setComments(res.data || []);
    } catch (err) {
      error(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      error('Comment cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      const res = await commentService.addComment(issueId, commentText);
      setComments((prev) => [...prev, res.data]);
      setCommentText('');
      success('Comment posted');
    } catch (err) {
      error(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setDeletingId(commentId);
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      success('Comment deleted');
    } catch (err) {
      error(err.message || 'Failed to delete comment');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 mt-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
        <MessageSquare className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-slate-800">
          Activity & Comments ({comments.length})
        </h3>
      </div>

      {/* Comment List */}
      <div className="py-4 space-y-4">
        {loading ? (
          <div className="text-xs text-slate-500 py-4 text-center">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-xs text-slate-400 py-6 text-center italic">
            No comments yet. Start the conversation below.
          </div>
        ) : (
          comments.map((c) => {
            const isAuthor = c.user?._id === user?._id;
            const canDelete = isAdmin || isAuthor;

            return (
              <div
                key={c._id}
                className="flex items-start gap-3 p-3.5 rounded-md bg-slate-50/70 border border-slate-100"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-medium text-[11px] flex items-center justify-center flex-shrink-0">
                  {getInitials(c.user?.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800">
                        {c.user?.name || 'Anonymous User'}
                      </span>
                      {c.user?.role === 'admin' && (
                        <span className="text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {formatDateTime(c.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-1.5 whitespace-pre-line leading-relaxed">
                    {c.text}
                  </p>
                </div>

                {canDelete && (
                  <button
                    onClick={() => handleDeleteComment(c._id)}
                    disabled={deletingId === c._id}
                    className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors disabled:opacity-50"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="pt-2">
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Leave a comment
        </label>
        <textarea
          rows={3}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Share an update, question, or note..."
          className="w-full text-xs p-3 bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 resize-none transition-colors"
        />

        <div className="flex justify-between items-center mt-2">
          <span className="text-[11px] text-slate-400">
            {commentText.length} / 2000
          </span>
          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="px-3.5 py-1.5 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            {submitting ? (
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            Post Comment
          </button>
        </div>
      </form>
    </div>
  );
};
