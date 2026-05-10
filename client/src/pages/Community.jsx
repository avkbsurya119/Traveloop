import { useEffect, useState, useCallback, useRef } from 'react'
import { Heart, MessageCircle, Share2, Send, Search, X, Copy, Sparkles, Hash } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardTitle } from '../components/common/Card'
import { Avatar } from '../components/common/Avatar'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Input } from '../components/common/Input'
import { CardSkeleton } from '../components/common/Skeleton'
import { toast } from '../components/common/Toast'
import { communityApi } from '../api/community'
import { tripsApi } from '../api/trips'
import { useAuthStore } from '../store/authStore'
import { formatDistanceToNow } from 'date-fns'

export default function Community() {
  const { user } = useAuthStore()
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [sort, setSort] = useState('recent')
  const [search, setSearch] = useState('')
  const [newPost, setNewPost] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [expandedComments, setExpandedComments] = useState(new Set())
  const [commentInputs, setCommentInputs] = useState({})
  const [postComments, setPostComments] = useState({})
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [cloningId, setCloningId] = useState(null)
  const observerRef = useRef(null)

  const fetchPosts = async (reset = false) => {
    const offset = reset ? 0 : page * 20
    if (reset) { setIsLoading(true); setPage(0) }
    else setIsLoadingMore(true)
    try {
      const { data } = await communityApi.getPosts({ sort, limit: 20, offset })
      if (reset) setPosts(data)
      else setPosts(prev => [...prev, ...data])
      setHasMore(data.length === 20)
    } catch { console.error('Failed to fetch posts') }
    finally { setIsLoading(false); setIsLoadingMore(false) }
  }

  useEffect(() => { fetchPosts(true) }, [sort])

  // Infinite scroll
  const lastPostRef = useCallback(node => {
    if (isLoadingMore) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(p => p + 1)
    })
    if (node) observerRef.current.observe(node)
  }, [isLoadingMore, hasMore])

  useEffect(() => { if (page > 0) fetchPosts(false) }, [page])

  const handlePost = async () => {
    if (!newPost.trim()) return
    setIsPosting(true)
    try {
      const { data } = await communityApi.createPost({ content: newPost })
      setPosts([data, ...posts])
      setNewPost('')
      toast.success('Posted to community! ✈️')
    } catch (error) { toast.error(error.response?.data?.error || 'Failed to post') }
    finally { setIsPosting(false) }
  }

  const handleLike = async (postId, isLiked) => {
    try {
      if (isLiked) await communityApi.unlikePost(postId)
      else await communityApi.likePost(postId)
      setPosts(posts.map(p => p.id === postId
        ? { ...p, isLiked: !isLiked, likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1 }
        : p))
    } catch { toast.error('Failed to update like') }
  }

  const toggleComments = async (postId) => {
    const next = new Set(expandedComments)
    if (next.has(postId)) { next.delete(postId) }
    else {
      next.add(postId)
      if (!postComments[postId]) {
        try {
          const { data } = await communityApi.getComments(postId)
          setPostComments(prev => ({ ...prev, [postId]: data }))
        } catch {}
      }
    }
    setExpandedComments(next)
  }

  const addComment = async (postId) => {
    const content = commentInputs[postId]?.trim()
    if (!content) return
    try {
      const { data } = await communityApi.addComment(postId, content)
      setPostComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), data] }))
      setCommentInputs(prev => ({ ...prev, [postId]: '' }))
      setPosts(posts.map(p => p.id === postId
        ? { ...p, _count: { ...p._count, comments: (p._count?.comments || 0) + 1 } }
        : p))
    } catch { toast.error('Failed to comment') }
  }

  const sharePost = async (post) => {
    const url = `${window.location.origin}/community?post=${post.id}`
    try {
      if (navigator.share) await navigator.share({ title: 'Traveloop Post', text: post.content.slice(0, 100), url })
      else { await navigator.clipboard.writeText(url); toast.success('Link copied!') }
    } catch {}
  }

  const cloneTrip = async (tripId) => {
    setCloningId(tripId)
    try {
      await tripsApi.clone(tripId)
      toast.success('Trip cloned to your trips! ✈️')
    } catch { toast.error('Failed to clone trip') }
    finally { setCloningId(null) }
  }

  const filteredPosts = search
    ? posts.filter(p =>
        p.content.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : posts

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Community</h1>
        <Badge variant="secondary" className="text-xs">
          <Sparkles size={12} className="inline mr-1" />
          Travel Stories
        </Badge>
      </div>

      {/* Create Post */}
      <Card className="border border-border/60">
        <div className="flex gap-3">
          <Avatar src={user?.avatarUrl} name={`${user?.firstName} ${user?.lastName}`} size="md" />
          <div className="flex-1">
            <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your travel experience... Use #hashtags for destinations!"
              rows={3}
              className="w-full px-4 py-3 bg-dark border border-border rounded-xl text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/60 resize-none transition-all text-sm" />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted">
                {newPost.length > 0 && `${newPost.length} chars`}
              </p>
              <Button onClick={handlePost} isLoading={isPosting} disabled={!newPost.trim()} className="gap-2">
                <Send size={15} /> Share
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Search + Sort */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
          <input type="text" placeholder="Search stories..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-surface border border-border rounded-full text-sm text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
              <X size={13} />
            </button>
          )}
        </div>
        <div className="flex gap-1 p-1 bg-surface rounded-full">
          {['recent', 'trending'].map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={`px-4 py-1.5 rounded-full text-xs capitalize font-medium transition-all ${sort === s ? 'bg-primary text-white shadow' : 'text-muted hover:text-white'}`}>
              {s === 'trending' ? '🔥 ' : '🕐 '}{s}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
      ) : filteredPosts.length === 0 ? (
        <Card className="text-center py-14">
          <div className="text-5xl mb-3">🌍</div>
          <p className="text-white font-semibold">{search ? 'No matching stories' : 'Be the first to share!'}</p>
          <p className="text-muted text-sm mt-1">
            {search ? `Nothing found for "${search}"` : 'Share your travel experience and inspire others.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post, i) => (
            <Card key={post.id} ref={i === filteredPosts.length - 1 ? lastPostRef : undefined}
              className="hover:border-border transition-colors">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Avatar src={post.user?.avatarUrl} name={`${post.user?.firstName} ${post.user?.lastName}`} size="md" />
                </div>
                <div className="flex-1 min-w-0">
                  {/* Author */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{post.user?.firstName} {post.user?.lastName}</span>
                    <span className="text-xs text-muted">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                    {post.trip && <Badge variant="secondary" className="text-xs">✈️ Trip story</Badge>}
                  </div>

                  {/* Content */}
                  <p className="text-white/90 mt-2 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {post.tags.map(t => (
                        <button key={t} onClick={() => setSearch(t)}
                          className="flex items-center gap-0.5 text-xs text-primary-light hover:text-primary transition-colors">
                          <Hash size={11} />#{t}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Linked Trip Card — with Copy Trip CTA */}
                  {post.trip && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-primary/10 to-transparent rounded-xl border border-primary/20 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted">Linked trip</p>
                        <p className="text-white font-semibold text-sm">{post.trip.title}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link to={`/trips/${post.trip.id}`}
                          className="px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-muted hover:text-white transition-colors">
                          View
                        </Link>
                        <button
                          onClick={() => cloneTrip(post.trip.id)}
                          disabled={cloningId === post.trip.id}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-light transition-all disabled:opacity-60 shadow-sm hover:shadow-primary/30"
                        >
                          <Copy size={11} />
                          {cloningId === post.trip.id ? 'Copying...' : 'Copy Trip'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Post image */}
                  {post.imageUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden">
                      <img src={post.imageUrl} alt="" className="w-full max-h-64 object-cover" loading="lazy" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-5 mt-4 pt-3 border-t border-border/40">
                    <button onClick={() => handleLike(post.id, post.isLiked)}
                      className={`flex items-center gap-1.5 text-sm transition-all ${post.isLiked ? 'text-danger scale-110' : 'text-muted hover:text-danger'}`}>
                      <Heart size={17} fill={post.isLiked ? 'currentColor' : 'none'} />
                      <span className="text-xs">{post.likesCount}</span>
                    </button>
                    <button onClick={() => toggleComments(post.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${expandedComments.has(post.id) ? 'text-primary-light' : 'text-muted hover:text-white'}`}>
                      <MessageCircle size={17} />
                      <span className="text-xs">{post._count?.comments || 0}</span>
                    </button>
                    <button onClick={() => sharePost(post)}
                      className="flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors">
                      <Share2 size={17} />
                    </button>
                  </div>

                  {/* Comments */}
                  {expandedComments.has(post.id) && (
                    <div className="mt-3 pt-3 border-t border-border/40 space-y-3 animate-fade-up">
                      {(postComments[post.id] || []).map(c => (
                        <div key={c.id} className="flex gap-2">
                          <Avatar src={c.user?.avatarUrl} name={`${c.user?.firstName} ${c.user?.lastName}`} size="xs" />
                          <div className="flex-1 bg-dark rounded-xl px-3 py-2">
                            <span className="text-xs font-semibold text-white">{c.user?.firstName}</span>
                            <p className="text-xs text-muted mt-0.5">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Avatar src={user?.avatarUrl} name={`${user?.firstName} ${user?.lastName}`} size="xs" />
                        <div className="flex-1 flex gap-2">
                          <input value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && addComment(post.id)}
                            placeholder="Write a comment..."
                            className="flex-1 px-3 py-1.5 bg-dark border border-border rounded-full text-xs text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary/50" />
                          <button onClick={() => addComment(post.id)}
                            className="p-1.5 text-primary hover:text-primary-light transition-colors">
                            <Send size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {isLoadingMore && (
            <div className="text-center py-6">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
