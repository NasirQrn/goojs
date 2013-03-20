attribute vec3 vertexPosition;
attribute vec2 vertexUV0;
attribute vec4 vertexWeights;
attribute vec4 vertexJointIDs;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 worldMatrix; 
uniform mat4 jointPalette[JOINT_COUNT];

varying vec2 texCoord0;

void main(void)
{
 mat4 mat = mat4(0.0);
 mat += jointPalette[int(vertexJointIDs.x)] * vertexWeights.x;
 mat += jointPalette[int(vertexJointIDs.y)] * vertexWeights.y;
 mat += jointPalette[int(vertexJointIDs.z)] * vertexWeights.z;
 mat += jointPalette[int(vertexJointIDs.w)] * vertexWeights.w;

 texCoord0 = vertexUV0;
 gl_Position = projectionMatrix * viewMatrix * worldMatrix * mat * vec4(vertexPosition, 1.0);  
}