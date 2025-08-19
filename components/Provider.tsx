import React, { ReactNode } from 'react'

import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth';

type Props = {
  children: ReactNode;
  session?: Session; // optional; pass it if you fetch on the server
};

const Provider = ({children, session}: Props) => {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}

export default Provider