import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import { Switch, Route, Redirect } from 'react-router-dom';
import DashboardPage from '../dashboard/DashboardPage';
import './MainContainer.css';

import Toolbar from './toolbar/Toolbar';
import Sidebar from './sidebar/Sidebar';
const { Content, Footer } = Layout;

class MainContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      date: '',
    };

    this.toggle = this.toggle.bind(this);
  }
  toggle() {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    return (
      <Layout id="components-layout-demo-responsive">
        {/* <Sider
          breakpoint="lg"
          collapsedWidth="0"
          onCollapse={(collapsed, type) => {
            console.log(collapsed, type);
          }}>
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
            <Menu.Item key="1">
              <Icon type="appstore-o" />
              <span className="nav-text">Dashboard</span>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="user" />
              <span className="nav-text">Tanent</span>
            </Menu.Item>
            <Menu.Item key="3">
              <Icon type="calendar" />
              <span className="nav-text">Calendar</span>
            </Menu.Item>
            <Menu.Item key="4">
              <Icon type="info-circle-o" />
              <span className="nav-text">Services</span>
            </Menu.Item>
          </Menu>
        </Sider> */}
        <Sidebar collapsed={this.state.collapsed} />
        <Layout>
          {/* <Header style={{ background: '#fff', padding: 0 }} /> */}
          <Toolbar toggleMenu={this.toggle} collapsed={this.state.collapsed} />
          <Content style={{ margin: '24px 16px 0' }}>
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
              <Switch>
                <Redirect exact from="/" to="/dashboard" />
                <Route path="/dashboard" component={DashboardPage} />
                {/* <Route path="/tenant" component={EmployeePage} />
          <Route path="/tenant/:id" component={EmployeeEdit} />
          <Route exact path="/schedule" component={SchedulePage} /> */}
              </Switch>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Ant Design ©2016 Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    );
  }
}
MainContainer.prototypes = {
  history: PropTypes.object.isRequired,
};

export default connect()(MainContainer);
