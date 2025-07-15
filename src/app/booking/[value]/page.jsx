import React from 'react'

function page({params}) {
    const {value} = params;

  return (
    <div>{value}</div>
  )
}

export default page