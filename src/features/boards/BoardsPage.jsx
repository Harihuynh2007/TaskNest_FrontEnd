// src/features/boards/BoardsPage.jsx
import React from 'react';
import WithHeaderAndSidebarLayout from '../../Layouts/WithHeaderAndSidebarLayout';
import BoardsHomePage from './BoardsHomePage';

export default function BoardsPage() {
  return (
    <WithHeaderAndSidebarLayout>
      <BoardsHomePage />
    </WithHeaderAndSidebarLayout>
  );
}
