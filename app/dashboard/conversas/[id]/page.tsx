import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatWindow } from '@/components/chat-window'

export default async function ConversaPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: conversation, error } = await supabase
    .from('conversations')
    .select(`
      *,
      product:products(id, title, images:product_images(url, is_primary)),
      buyer:profiles!conversations_buyer_id_fkey(id, name),
      seller:profiles!conversations_seller_id_fkey(id, name)
    `)
    .eq('id', params.id)
    .single()

  console.log('conversation:', conversation)
  console.log('error:', error)

  if (!conversation) redirect('/dashboard/conversas')

  const isParticipant = conversation.buyer_id === user.id || conversation.seller_id === user.id
  if (!isParticipant) redirect('/dashboard/conversas')

  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:profiles(id, name)')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true })

  const isbuyer = conversation.buyer_id === user.id
  const otherPerson = isbuyer ? conversation.seller : conversation.buyer

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">{conversation.product?.title}</h1>
        <p className="text-sm text-muted-foreground">
          Conversa com {otherPerson?.name}
        </p>
      </div>
      <ChatWindow
        conversationId={params.id}
        initialMessages={messages || []}
        currentUserId={user.id}
      />
    </div>
  )
}