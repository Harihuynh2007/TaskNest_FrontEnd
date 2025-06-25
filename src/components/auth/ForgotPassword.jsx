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

        </container>
    )
};