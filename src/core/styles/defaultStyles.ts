import { StylesProps } from '../types';

export const defaultStyles: Required<StylesProps> = {
    badgesButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '16px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        transition: 'transform 0.2s ease-in-out',
    },
    badgesModal: {
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        },
        content: {
            position: 'relative',
            background: '#fff',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
        },
        closeButton: {
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0',
        },
        achievementList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
        },
        achievementItem: {
            display: 'flex',
            gap: '16px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: '#f5f5f5',
            alignItems: 'center',
        },
        achievementTitle: {
            margin: '0',
            fontSize: '18px',
            fontWeight: 'bold',
        },
        achievementDescription: {
            margin: '4px 0 0 0',
            color: '#666',
        },
        achievementIcon: {
            fontSize: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
    },
}; 