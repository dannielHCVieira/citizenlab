import React, { PureComponent } from 'react';

import { Outlet as RouterOutlet } from '@tanstack/react-router';

export interface Props {}

interface State {}

export default class CustomFieldsDashboard extends PureComponent<Props, State> {
  render() {
    return (
      <>
        <RouterOutlet />
      </>
    );
  }
}
