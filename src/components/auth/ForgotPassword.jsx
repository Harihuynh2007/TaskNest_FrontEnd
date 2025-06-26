import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function ForgotPassword({baseUrl = ''}){

    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle' | 'success' | 'error'
    const [loading, setLoading] = useState(false);

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        try{
            // TODO: replace with real API call
            // await fetch(`${baseUrl}/auth/forgot-password`, {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ email }),
            // });
            // simulate delay
            setTimeout(() => {
                setStatus('success');
                setLoading(false);
            },1000);
        } catch(err){
            console.error(err);
            setStatus('error');
            setLoading(false);
        }
    };

    return (
        <container fluid className = "min-vh-100 d-flex justify-content-center align-items-center bg-light px-3">
            <Row className = "w-100 justify-content-center">
                <Col xs={12} sm={8} md={6} lg={4}>
                    <Card className="p-4 shadow">
                        <h4 className="text-center mb-3">Forgot Password </h4>

                        {status === 'success' && (
                            <Alert variant='success'> 
                                If this email exists, we'll send you a reset link.
                            </Alert>
                        )}
                        {status === 'error' && (
                            <Alert variant='danger'>
                                Something went wrong. Please try again.
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="forgotEmail" classame="mb-3  ">
                                <Form.Label>
                                    We'll send a recovery link to
                                </Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder='Enter your email'
                                    Value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className='mb-2'
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </Form>

                        <div className ="mt-3 text-center">
                            <Link to ="/login">Return to Log in</Link>
                        </div>
                    </Card>
                </Col>

            </Row>
        </container>
    )
};