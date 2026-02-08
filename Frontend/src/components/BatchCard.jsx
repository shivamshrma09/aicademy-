import React from "react";
import {
  Trophy, Users, BookOpen, Clock, GraduationCap
} from "lucide-react";

const BatchCard = ({ batch, onCardClick, onContinueClick }) => {
  const handleImageError = (e) => {
    e.target.src = 'https://ik.imagekit.io/qwzhnpeqg/7c3d9081-eca6-4f7c-a313-4c20862c737b.png';
  };

  return (
    <div
      onClick={() => onCardClick && onCardClick(batch)}
      style={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: '350px',
        position: 'relative',
        '&:hover': {
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          transform: 'translateY(-4px)'
        }
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Badge */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: batch.type === 'custom' ? '#3b82f6' : '#10b981',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '700',
          zIndex: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {batch.type === 'custom' ? 'AI Generated' : 'Standard'}
      </div>

      {/* Image Section */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '35%',
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#f3f4f6'
        }}
      >
        <img
          src={batch.image || 'https://ik.imagekit.io/qwzhnpeqg/7c3d9081-eca6-4f7c-a313-4c20862c737b.png'}
          alt={batch.title}
          onError={handleImageError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        {batch.progress === 100 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(16, 185, 129, 0.95)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '700',
              fontSize: '14px'
            }}
          >
            <Trophy size={20} />
            <span>Completed</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div
        style={{
          padding: '12px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        {/* Title */}
        <div>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '4px',
              lineHeight: '1.4',
              maxHeight: '2.8em',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {batch.title}
          </h3>

          {/* Instructor */}
          {batch.instructor && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '4px',
                color: '#6b7280',
                fontSize: '12px'
              }}
            >
              <GraduationCap size={13} />
              <span>{batch.instructor}</span>
            </div>
          )}

          {/* Subject */}
          {batch.subject && (
            <p
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                marginBottom: '6px'
              }}
            >
              {batch.subject}
            </p>
          )}

          {/* Meta Info Row 1 */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '6px',
              fontSize: '11px',
              color: '#6b7280',
              flexWrap: 'wrap'
            }}
          >
            {batch.totalChapters && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <BookOpen size={12} /> {batch.totalChapters} Ch
              </span>
            )}
            {batch.estimatedTime && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={12} /> {batch.estimatedTime}
              </span>
            )}
            {batch.enrolledStudents && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Users size={12} /> {batch.enrolledStudents}
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid - 3 columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            marginBottom: '6px',
            padding: '6px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px'
          }}
        >
          {batch.difficulty && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '3px' }}>
                Difficulty
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                {batch.difficulty}
              </div>
            </div>
          )}
          {batch.language && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '3px' }}>
                Language
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                {batch.language}
              </div>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '3px' }}>
              Progress
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6' }}>
              {batch.progress || 0}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#e5e7eb',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '6px'
          }}
        >
          <div
            style={{
              width: `${batch.progress || 0}%`,
              height: '100%',
              backgroundColor: '#3b82f6',
              transition: 'width 0.3s ease'
            }}
          ></div>
        </div>

        {/* Footer with Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #e5e7eb',
            marginTop: 'auto'
          }}
        >
          {batch.progress === 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onContinueClick && onContinueClick(batch);
              }}
              style={{
                flex: 1,
                backgroundColor: '#10b981',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#10b981';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <BookOpen size={16} />
              Join Batch
            </button>
          ) : (
            <>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}
                >
                  {(batch.completedChapters || 0)}/{batch.totalChapters || 0} completed
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onContinueClick && onContinueClick(batch);
                }}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Continue →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchCard;
