import React from 'react'
import FriendRequests from './FriendRequests'
import MessagesList from './MessagesList'

const Widgets = () => {
  return (
    <section className="widgets">
      <MessagesList />
      <FriendRequests />
    </section>
  )
}

export default Widgets
