import _ from 'lodash'
import React from 'react'
import axios from 'axios'
import { withRouter, Link } from 'react-router-dom'
import { Container, Button } from 'reactstrap'
import styled from 'styled-components'
import { Delete } from 'styled-icons/feather/Delete'
import config from '../../config'
import PostListItem from '../common/PostListItem'

const Heading = styled.div`
  display: flex;
  align-items: center;
`
const DeletePost = styled(Delete)`
  cursor: pointer;
  margin-bottom: -6px;
  &:hover {
    color: red;
  }
`

class PostList extends React.Component {
  state = {
    posts: []
  }

  async componentDidMount() {
    await this.fetchPosts()
  }

  fetchPosts = async () => {
    const response = await axios.get(config.apiUrl + '/posts')
    const posts = _.get(response, 'data.items')
    this.setState({ posts })
  }

  triggerEditPost = (id) => () => {
    const { history } = this.props
    const url = '/admin/posts/' + id + '/edit'
    history.push(url)
  }

  confirmDeletePost = () => window.confirm('This action will permanently delete this post. Press OK if you want to proceed.');
  deletePost = (id) => async () => {
    const consented = this.confirmDeletePost()
    if (consented) {
      await axios.delete(config.apiUrl + '/posts/' + id)
      this.setState(state => ({
        posts: state.posts.filter(post => post.id !== id)
      }))
    }
  }

  confirmPublishAll = () => window.confirm('This action will publish all the posts. Press OK if you want to proceed.');
  publishAll = async () => {
    const consented = this.confirmPublishAll()
    if (consented) {
      await axios.post(config.apiUrl + '/posts/publish_all')
      await this.fetchPosts()
    }
  }

  render() {
    const { posts } = this.state
    if (!posts) {
      return null
    }
    return (
      <Container style={{ padding: '40px 0' }}>
        <Link to="/admin/new" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', marginRight: '4px' }}>
          <Button color="success">
            Create a new Post
          </Button>
        </Link>
        <Button color="danger" onClick={this.publishAll}>
          Publish All
        </Button>
        {
          posts.map((post, i) => (
            <PostListItem key={i}>
              <Heading>
                <PostListItem.Title onClick={this.triggerEditPost(post.id)}>
                  {post.title} &nbsp;
                </PostListItem.Title>
                <DeletePost size="30" onClick={this.deletePost(post.id)} title="Delete Post" />
              </Heading>
              <PostListItem.Subtitle>
                {_.get(post, 'ttr.text')} -
                {` `}{_.get(post, 'status')}
              </PostListItem.Subtitle>
              <PostListItem.Summary>
                {post.summary}
              </PostListItem.Summary>
            </PostListItem>
          ))
        }
      </Container>
    )
  }
}

export default withRouter(PostList)
